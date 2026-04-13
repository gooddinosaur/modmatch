"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
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
      // AuthContext will redirect to /admin/dashboard if role === "admin"
      // If not admin, we catch it below
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
      {/* Red-tinted glow for admin */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "400px",
        background: "radial-gradient(circle, rgba(255,77,0,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent2)", letterSpacing: "3px", textTransform: "uppercase" }}>
              Restricted Access
            </p>
            <span style={{
              background: "rgba(255,77,0,0.15)", color: "var(--accent2)",
              fontSize: "10px", fontWeight: 700, padding: "2px 8px",
              borderRadius: "20px", letterSpacing: "1px",
            }}>
              ADMIN ONLY
            </span>
          </div>
          <h1 className="display-font" style={{ fontSize: "56px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "12px" }}>
            ADMIN<br />
            <span style={{ color: "var(--accent2)" }}>PORTAL</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>
            This portal is restricted to authorized administrators only. Admin accounts are provisioned by the platform operator.
          </p>
        </div>

        <div className="card" style={{ padding: "32px", borderColor: "rgba(255,77,0,0.2)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@modmatch.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ borderColor: "rgba(255,77,0,0.3)" }}
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
                  style={{ borderColor: "rgba(255,77,0,0.3)", paddingRight: "40px" }}
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
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "var(--accent2)", color: "#fff",
                fontWeight: 700, padding: "14px", borderRadius: "6px",
                border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                fontSize: "15px", marginTop: "8px", opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
          <Link href="/login" style={{ color: "var(--muted)", textDecoration: "none" }}>
            ← Back to regular sign in
          </Link>
        </p>
      </div>
    </div>
  );
}