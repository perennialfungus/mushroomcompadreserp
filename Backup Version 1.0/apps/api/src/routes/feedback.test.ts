import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import type { ApiConfig } from "../config.js";
import { createMemoryDataStore } from "../datastore.js";

const jwtSecret = "test-supabase-jwt-secret-with-enough-length";
const issuer = "https://example.supabase.co/auth/v1";
const audience = "authenticated";

const config: ApiConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SUPABASE_JWT_SECRET: jwtSecret,
  SUPABASE_JWT_ISSUER: issuer,
  SUPABASE_JWT_AUDIENCE: audience
};

describe("feedback and release note routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({
      config,
      dataStore: createMemoryDataStore(),
      logger: false
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("allows any logged-in staff user to submit feedback with reproduction context", async () => {
    const token = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const response = await app.inject({
      method: "POST",
      url: "/api/feedback",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        screen: "/inventory",
        workflow: "Inventory adjustment",
        module: "inventory",
        category: "bug",
        severity: "high",
        roleCode: "packing_fulfillment",
        device: "Android Chrome",
        notes: "Adjustment form did not show the offline pending state.",
        reproductionContextJson: { route: "/inventory", online: false },
        attachment: {
          fileName: "inventory-offline.png",
          contentType: "image/png",
          dataUrl: "data:image/png;base64,AA=="
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().feedback).toMatchObject({
      workflow: "Inventory adjustment",
      status: "new",
      priority: 2,
      submittedBy: "user-staff",
      attachments: [{ fileName: "inventory-offline.png" }]
    });
  });

  it("lets admins triage, assign, close, and export feedback", async () => {
    const token = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const listResponse = await app.inject({
      method: "GET",
      url: "/api/admin/feedback?module=inventory",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(listResponse.statusCode).toBe(200);
    const feedback = listResponse.json().feedback[0];
    expect(feedback.module).toBe("inventory");

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/api/admin/feedback/${feedback.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        status: "done",
        priority: 1,
        assignedTo: "user-owner"
      }
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().feedback).toMatchObject({
      status: "done",
      priority: 1,
      assignedTo: "user-owner",
      assigneeName: "Owner Admin"
    });
    expect(updateResponse.json().feedback.closedAt).toBeTruthy();

    const csvResponse = await app.inject({
      method: "GET",
      url: "/api/admin/feedback/export.csv",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(csvResponse.statusCode).toBe(200);
    expect(csvResponse.body).toContain("workflow");
    expect(csvResponse.body).toContain("Offline stock count");
  });

  it("blocks non-admin users from feedback triage", async () => {
    const token = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/feedback",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it("converts multiple feedback items into a scored backlog item and release note", async () => {
    const token = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const feedbackResponse = await app.inject({
      method: "POST",
      url: "/api/feedback",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        screen: "/stock-counts",
        workflow: "Offline stock count",
        module: "inventory",
        category: "offline_sync",
        severity: "critical",
        roleCode: "owner_admin",
        device: "Desktop Chrome",
        notes: "Supervisor review also stayed pending after reconnect.",
        reproductionContextJson: { route: "/stock-counts", online: false }
      }
    });
    expect(feedbackResponse.statusCode).toBe(201);
    const newFeedback = feedbackResponse.json().feedback;

    const createBacklogResponse = await app.inject({
      method: "POST",
      url: "/api/admin/roadmap/backlog-items",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Repair offline stock count reconnect handling",
        description: "Make stock count upload state settle without a manual page refresh.",
        userImpact: 5,
        frequency: 4,
        complianceRisk: 3,
        revenueImpact: 2,
        effortEstimate: 2,
        dependency: 1,
        feedbackIds: ["feedback-offline-count-device", newFeedback.id]
      }
    });
    expect(createBacklogResponse.statusCode).toBe(201);
    expect(createBacklogResponse.json().backlogItem).toMatchObject({
      module: "inventory",
      workflow: "Offline stock count",
      priority: 1,
      horizon: "now"
    });
    expect(createBacklogResponse.json().backlogItem.feedback).toHaveLength(2);
    expect(createBacklogResponse.json().backlogItem.priorityExplanation).toContain("2 linked feedback items");

    const backlogItem = createBacklogResponse.json().backlogItem;
    const completeResponse = await app.inject({
      method: "PATCH",
      url: `/api/admin/roadmap/backlog-items/${backlogItem.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { status: "completed" }
    });
    expect(completeResponse.statusCode).toBe(200);

    const releaseResponse = await app.inject({
      method: "POST",
      url: "/api/admin/roadmap/releases",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        version: "0.25.2-beta",
        name: "Offline count follow-up",
        plannedDate: "2026-07-10T09:00:00.000Z"
      }
    });
    expect(releaseResponse.statusCode).toBe(201);
    const release = releaseResponse.json().release;

    const assignResponse = await app.inject({
      method: "POST",
      url: `/api/admin/roadmap/releases/${release.id}/items`,
      headers: { authorization: `Bearer ${token}` },
      payload: { backlogItemIds: [backlogItem.id] }
    });
    expect(assignResponse.statusCode).toBe(200);
    expect(assignResponse.json().release.backlogItems).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: backlogItem.id })])
    );

    const noteResponse = await app.inject({
      method: "POST",
      url: `/api/admin/roadmap/releases/${release.id}/release-note`,
      headers: { authorization: `Bearer ${token}` }
    });
    expect(noteResponse.statusCode).toBe(200);
    expect(noteResponse.json().releaseNote).toMatchObject({
      version: "0.25.2-beta",
      title: "Offline count follow-up"
    });
    expect(noteResponse.json().releaseNote.body).toContain("Repair offline stock count reconnect handling");

    const promptResponse = await app.inject({
      method: "GET",
      url: "/api/admin/roadmap/export.codex",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(promptResponse.statusCode).toBe(200);
    expect(promptResponse.body).toContain("Build Roadmap Item - Repair offline stock count reconnect handling");
  });

  it("publishes release notes per version and shows published notes to staff", async () => {
    const ownerToken = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/admin/release-notes",
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        version: "0.25.1-beta",
        title: "Feedback fixes",
        body: "Improved feedback intake and admin triage.",
        status: "published"
      }
    });
    expect(createResponse.statusCode).toBe(201);

    const staffToken = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const listResponse = await app.inject({
      method: "GET",
      url: "/api/release-notes",
      headers: { authorization: `Bearer ${staffToken}` }
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().releaseNotes).toEqual(
      expect.arrayContaining([expect.objectContaining({ version: "0.25.1-beta", status: "published" })])
    );
  });
});

async function createToken(sub: string, email: string): Promise<string> {
  return new SignJWT({
    aud: audience,
    email,
    role: "authenticated"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(jwtSecret));
}
