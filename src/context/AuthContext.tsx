import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "../api/auth";
import type { AuthResponse } from "../types";

type AuthState = {
  token: string | null;
  user: AuthResponse | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<AuthResponse | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "admin_auth_token_v1";
const USER_KEY = "admin_auth_user_v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY) ??
      null
    );
  });

  const [user, setUser] = useState<AuthResponse | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw =
        localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const me = await authApi.getCurrentUser(token);
        if (!mounted) return;
        setUser(me ?? null);
        try {
          if (localStorage.getItem(STORAGE_KEY) === token) {
            localStorage.setItem(USER_KEY, JSON.stringify(me ?? null));
          } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(me ?? null));
          }
        } catch {}
      } catch {
        if (!mounted) return;
        setToken(null);
        setUser(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(USER_KEY);
        } catch {}
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(
    username: string,
    password: string,
    remember: boolean,
  ): Promise<AuthResponse | null> {
    setIsLoading(true);
    try {
      console.debug("[Auth] login start", { username, remember });
      const res = await authApi.login(username, password);
      console.debug("[Auth] login response", res);
      const returnedToken = res?.token ?? null;

      let me: AuthResponse | null = null;
      try {
        me = await authApi.getCurrentUser(returnedToken ?? undefined);
        console.debug("[Auth] getCurrentUser result", me);
      } catch (getErr) {
        console.debug("[Auth] getCurrentUser failed", getErr);
      }

      const success = Boolean(returnedToken) || Boolean(me);
      if (!success) {
        console.debug("[Auth] authentication failed — no token and no user");
        throw new Error("Authentication failed");
      }

      setToken(returnedToken);
      setUser(me ?? null);

      try {
        if (remember) {
          if (returnedToken) localStorage.setItem(STORAGE_KEY, returnedToken);
          localStorage.setItem(USER_KEY, JSON.stringify(me ?? null));
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(USER_KEY);
        } else {
          if (returnedToken) sessionStorage.setItem(STORAGE_KEY, returnedToken);
          sessionStorage.setItem(USER_KEY, JSON.stringify(me ?? null));
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (storageErr) {
        console.debug("[Auth] storage write failed", storageErr);
      }

      return me ?? res ?? null;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {}
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      logout,
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
