import { describe, expect, it } from "vitest";

import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("admin routes", () => {
  it("rejects unauthenticated user administration requests", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({ method: "GET", url: "/api/admin/users" });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("forbids non-admin user administration requests", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/users",
      headers: {
        authorization: "Bearer test-staff"
      }
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("allows owner/admin users to assign location-scoped roles", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "PATCH",
      url: "/api/admin/users/user-staff",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        roleAssignments: [
          {
            roleId: "role-production",
            locationId: "loc-farm"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.roles).toEqual([
      expect.objectContaining({
        roleCode: "production_farm",
        locationId: "loc-farm",
        locationName: "Rogil Farm"
      })
    ]);
    await app.close();
  });

  it("allows authenticated staff to update their own locale preference", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: {
        authorization: "Bearer test-staff"
      },
      payload: {
        locale: "en"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({
      id: "user-staff",
      locale: "en"
    });
    await app.close();
  });

  it("returns 400 for unknown role or location assignments", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const unknownRoleResponse = await app.inject({
      method: "PATCH",
      url: "/api/admin/users/user-staff",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        roleAssignments: [
          {
            roleId: "role-missing",
            locationId: null
          }
        ]
      }
    });

    expect(unknownRoleResponse.statusCode).toBe(400);
    expect(unknownRoleResponse.json()).toMatchObject({
      error: "bad_request"
    });

    const unknownLocationResponse = await app.inject({
      method: "PATCH",
      url: "/api/admin/users/user-staff",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        roleAssignments: [
          {
            roleId: "role-production",
            locationId: "loc-missing"
          }
        ]
      }
    });

    expect(unknownLocationResponse.statusCode).toBe(400);
    expect(unknownLocationResponse.json()).toMatchObject({
      error: "bad_request"
    });
    await app.close();
  });
});
