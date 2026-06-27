import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { getMe, updateProfileLocale } from "./lib/api";
import { getSupabaseClient, toAppSession } from "./lib/supabase";
import type { Session, UserContext } from "./types";

type AuthState = {
  loading: boolean;
  session: Session | null;
  userContext: UserContext | null;
  isAdmin: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  setProfileLocale(locale: "en" | "pt"): Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function hasAdminRole(userContext: UserContext | null): boolean {
  return userContext?.roles.some((role) => role.code === "owner_admin") ?? false;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const restoreUserContext = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setUserContext(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getMe(nextSession.accessToken);
      setUserContext(response.userContext);
    } catch {
      setSession(null);
      setUserContext(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        if (!cancelled) {
          void restoreUserContext(toAppSession(data.session));
        }
      })
      .catch(() => {
        if (!cancelled) {
          void restoreUserContext(null);
        }
      });

    const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void restoreUserContext(toAppSession(nextSession));
    });

    return () => {
      cancelled = true;
      listener.data.subscription.unsubscribe();
    };
  }, [restoreUserContext, supabase]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      userContext,
      isAdmin: hasAdminRole(userContext),
      async signIn(email: string, password: string) {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setLoading(false);
          throw error;
        }

        if (!data.session) {
          setLoading(false);
          throw new Error("Supabase did not return a session");
        }

        await restoreUserContext(toAppSession(data.session));
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }

        setSession(null);
        setUserContext(null);
      },
      async setProfileLocale(locale) {
        if (!session) {
          return;
        }

        await updateProfileLocale(session.accessToken, locale);
        setUserContext((current) => (current ? { ...current, locale } : current));
      }
    }),
    [loading, restoreUserContext, session, supabase, userContext]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
