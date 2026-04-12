"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  email: string;
  role: "buyer" | "seller" | "admin";
  token: string;
  id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: "buyer" | "seller", display_name?: string, description?: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("modmatch_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    const authUser: AuthUser = { email: data.email, role: data.role, token: data.access_token, id: data.id };
    setUser(authUser);
    localStorage.setItem("modmatch_user", JSON.stringify(authUser));

    // Redirect based on role
    if (data.role === "admin") router.push("/admin/dashboard");
    else if (data.role === "seller") router.push("/seller/dashboard");
    else router.push("/search");
  };

  const register = async (email: string, password: string, role: "buyer" | "seller", display_name?: string, description?: string, phone?: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, display_name, description, phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    const authUser: AuthUser = { email: data.email, role: data.role, token: data.access_token, id: data.id };
    setUser(authUser);
    localStorage.setItem("modmatch_user", JSON.stringify(authUser));

    if (data.role === "seller") router.push("/seller/dashboard");
    else router.push("/search");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("modmatch_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}