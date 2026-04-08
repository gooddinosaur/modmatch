"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Wrench } from "lucide-react";

type Role = "buyer" | "seller";

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      await register(email, password, role);
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
      <div style={{
        position: "absolute", top: "10%", right: "20%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(232,255,0,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Join ModMatch
          </p>
          <h1 className="display-font" style={{ fontSize: "56px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "12px" }}>
            CREATE<br />
            <span style={{ color: "var(--accent)" }}>ACCOUNT</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Role Selector */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                I want to join as
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {([
                  { value: "buyer" as Role, label: "Buyer", sub: "Find & buy parts", icon: <ShieldCheck size={20} strokeWidth={1.5} /> },
                  { value: "seller" as Role, label: "Seller", sub: "List & sell parts", icon: <Wrench size={20} strokeWidth={1.5} /> },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    style={{
                      background: role === opt.value ? "rgba(232,255,0,0.08)" : "var(--surface2)",
                      border: `1px solid ${role === opt.value ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--text)",
                      fontFamily: "DM Sans, sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ color: role === opt.value ? "var(--accent)" : "var(--muted)", marginBottom: "6px" }}>
                      {opt.icon}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>{opt.label}</div>
                    <div style={{ color: "var(--muted)", fontSize: "12px" }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px" }}>
                ⚠️ Your role is permanent and cannot be changed after registration.
              </p>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Confirm Password
              </label>
              <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
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
              style={{ width: "100%", padding: "14px", fontSize: "15px" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}