"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(circle, rgba(232,255,0,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Welcome Back
          </p>
          <h1 className="display-font" style={{ fontSize: "56px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "12px" }}>
            SIGN<br />
            <span style={{ color: "var(--accent)" }}>IN</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)",
                borderRadius: "6px", padding: "10px 14px",
                color: "var(--red)", fontSize: "13px",
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-accent"
              style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "8px" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--muted)" }}>
          Admin?{" "}
          <Link href="/admin/login" style={{ color: "var(--accent2)", textDecoration: "none", fontWeight: 600 }}>
            Admin login →
          </Link>
        </p>
      </div>
    </div>
  );
}