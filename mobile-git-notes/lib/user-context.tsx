import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clearToken, getToken } from "./auth";
import { api } from "./api";

type AppUser = {
  id: number;
  login: string | null;
  avatar_url: string | null;
};

type UserContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await api.get<AppUser>("/auth/github/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: loading,
      refreshUser,
      logout,
    }),
    [user, loading, refreshUser, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
