import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { AuthProvider, useAuth } from "./auth";
import type { SupabaseAuthClient } from "./lib/supabase";

type MockSession = {
  access_token: string;
  user: {
    email: string;
  };
};

function createSupabaseMock(initialSession: MockSession | null = null): SupabaseAuthClient {
  let session = initialSession;
  const listeners = new Set<(session: MockSession | null) => void>();

  return {
    auth: {
      async getSession() {
        return { data: { session }, error: null };
      },
      async signInWithPassword({ email }) {
        session = {
          access_token: email.includes("staff") ? "staff-session" : "owner-session",
          user: { email }
        };
        listeners.forEach((listener) => listener(session));
        return { data: { session }, error: null };
      },
      async signOut() {
        session = null;
        listeners.forEach((listener) => listener(null));
        return { error: null };
      },
      onAuthStateChange(callback) {
        const listener = (nextSession: MockSession | null) =>
          callback(nextSession ? "SIGNED_IN" : "SIGNED_OUT", nextSession);
        listeners.add(listener);

        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(listener);
              }
            }
          }
        };
      }
    }
  };
}

function AuthHarness() {
  const auth = useAuth();

  if (auth.loading) {
    return <p>Loading session</p>;
  }

  return (
    <section>
      <p>{auth.session ? "Signed in" : "Signed out"}</p>
      <p>{auth.userContext?.displayName ?? "No user"}</p>
      <p>Admin: {auth.isAdmin ? "yes" : "no"}</p>
      <button onClick={() => void auth.signIn("owner@mushroom-compadres.test", "password")}>
        Sign in owner
      </button>
      <button onClick={() => void auth.signOut()}>Sign out</button>
      <button onClick={() => void auth.setProfileLocale("pt")}>Use Portuguese</button>
    </section>
  );
}

function renderWithAuth(children: ReactNode) {
  return render(<AuthProvider>{children}</AuthProvider>);
}

function mockApiFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const authorization = new Headers(init?.headers).get("authorization");
    const isOwner = authorization === "Bearer owner-session" || authorization === "Bearer test-owner";

    if (url.endsWith("/api/me")) {
      return Response.json({
        userContext: {
          authUserId: isOwner ? "auth-owner" : "auth-staff",
          userId: isOwner ? "user-owner" : "user-staff",
          email: isOwner ? "owner@mushroom-compadres.test" : "staff@mushroom-compadres.test",
          displayName: isOwner ? "Owner Admin" : "Packing Staff",
          locale: "en",
          organizationId: "org-mc",
          roles: isOwner
            ? [{ code: "owner_admin", name: "Owner/Admin", locationId: null }]
            : [{ code: "packing_fulfillment", name: "Packing/Fulfillment", locationId: "loc-pack" }]
        }
      });
    }

    if (url.endsWith("/api/me/profile")) {
      return Response.json({ user: { locale: "pt" } });
    }

    return new Response(null, { status: 404 });
  });
}

describe("AuthProvider", () => {
  beforeEach(() => {
    window.__MC_SUPABASE_MOCK__ = createSupabaseMock();
    vi.stubGlobal("fetch", mockApiFetch());
  });

  afterEach(() => {
    delete window.__MC_SUPABASE_MOCK__;
    vi.unstubAllGlobals();
  });

  it("signs staff in and out through the mocked Supabase session", async () => {
    const user = userEvent.setup();
    renderWithAuth(<AuthHarness />);

    expect(await screen.findByText("Signed out")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign in owner" }));

    expect(await screen.findByText("Signed in")).toBeInTheDocument();
    expect(screen.getByText("Owner Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin: yes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use Portuguese" }));
    expect(await screen.findByText("Owner Admin")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByText("Signed out")).toBeInTheDocument();
    expect(screen.getByText("No user")).toBeInTheDocument();
  });

  it("restores an existing Supabase session on load", async () => {
    window.__MC_SUPABASE_MOCK__ = createSupabaseMock({
      access_token: "owner-session",
      user: { email: "owner@mushroom-compadres.test" }
    });

    renderWithAuth(<AuthHarness />);

    await waitFor(() => expect(screen.queryByText("Loading session")).not.toBeInTheDocument());
    expect(screen.getByText("Signed in")).toBeInTheDocument();
    expect(screen.getByText("Owner Admin")).toBeInTheDocument();
  });
});
