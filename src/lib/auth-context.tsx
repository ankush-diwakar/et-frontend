import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, API_BASE, setAccessToken, type ApiError } from "./api";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "CUSTOMER" | "SUPER_ADMIN";
  status: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (data.accessToken) setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const data = await api<{ user: User; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const data = await api<{ user: User; accessToken: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
    } catch {
      // Ignore — clear local state regardless
    }
    setAccessToken(null);
    setUser(null);
  };

  const updatePhone = async (phone: string) => {
    try {
      const data = await api<{ user: User }>("/user/phone", {
        method: "PATCH",
        body: JSON.stringify({ phone }),
      });
      setUser(data.user);
      toast.success("Phone number updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update phone number");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updatePhone,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
