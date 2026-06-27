import { createClient, type AuthChangeEvent, type Session as SupabaseSession } from "@supabase/supabase-js";

import type { Session } from "../types";

type SupabaseSessionLike = {
  access_token: string;
  user: {
    email?: string | null;
  };
};

type SignInResult = { data: { session: SupabaseSessionLike | null }; error: Error | null };

export type SupabaseAuthClient = {
  auth: {
    getSession(): Promise<SignInResult>;
    signInWithPassword(input: { email: string; password: string }): Promise<SignInResult>;
    signOut(): Promise<{ error: Error | null }>;
    onAuthStateChange(
      callback: (event: AuthChangeEvent | "DEV_SIGNED_IN" | "DEV_SIGNED_OUT", session: SupabaseSessionLike | null) => void
    ): {
      data: {
        subscription: {
          unsubscribe(): void;
        };
      };
    };
  };
};

declare global {
  interface Window {
    __MC_SUPABASE_MOCK__?: SupabaseAuthClient;
  }
}

export const authStorageKey = "mc.auth.session";

export function toAppSession(session: SupabaseSessionLike | SupabaseSession | null): Session | null {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    email: session.user.email ?? null
  };
}

function createLocalSupabaseClient(): SupabaseAuthClient {
  const listeners = new Set<(session: SupabaseSessionLike | null) => void>();

  function readSession(): SupabaseSessionLike | null {
    const raw = window.localStorage.getItem(authStorageKey);
    return raw ? (JSON.parse(raw) as SupabaseSessionLike) : null;
  }

  function writeSession(session: SupabaseSessionLike | null): void {
    if (session) {
      window.localStorage.setItem(authStorageKey, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(authStorageKey);
    }

    listeners.forEach((listener) => listener(session));
  }

  return {
    auth: {
      async getSession() {
        return { data: { session: readSession() }, error: null };
      },
      async signInWithPassword({ email }) {
        const session = {
          access_token: email.toLowerCase().includes("staff") ? "test-staff" : "test-owner",
          user: { email }
        };
        writeSession(session);
        return { data: { session }, error: null };
      },
      async signOut() {
        writeSession(null);
        return { error: null };
      },
      onAuthStateChange(callback) {
        const listener = (session: SupabaseSessionLike | null) =>
          callback(session ? "DEV_SIGNED_IN" : "DEV_SIGNED_OUT", session);
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

export function getSupabaseClient(): SupabaseAuthClient {
  if (window.__MC_SUPABASE_MOCK__) {
    return window.__MC_SUPABASE_MOCK__;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !anonKey) {
    return createLocalSupabaseClient();
  }

  return createClient(supabaseUrl, anonKey) as SupabaseAuthClient;
}
