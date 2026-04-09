"use client";
import Link from "next/link";
import { ShieldCheck, Wrench, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "10%", right: "20%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(232,255,0,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Join ModMatch
          </p>
          <h1 className="display-font" style={{ fontSize: "64px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "16px" }}>
            WHO ARE<br /><span style={{ color: "var(--accent)" }}>YOU?</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "15px" }}>
            Choose your role to get started. Your role is permanent.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <Link href="/register/buyer" style={{ textDecoration: "none" }}>
            <div className="card" style={{
              padding: "32px 24px", borderColor: "var(--border)",
              cursor: "pointer", transition: "all 0.2s", textAlign: "center", height: "100%",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--green)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(0,230,118,0.04)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: "56px", height: "56px", borderRadius: "12px",
                background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <ShieldCheck size={28} color="var(--green)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>Buyer</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.5, marginBottom: "20px" }}>
                Find guaranteed-fit parts for your car with escrow-protected payments.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--green)", fontSize: "13px", fontWeight: 600 }}>
                Get Started <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link href="/register/seller" style={{ textDecoration: "none" }}>
            <div className="card" style={{
              padding: "32px 24px", borderColor: "var(--border)",
              cursor: "pointer", transition: "all 0.2s", textAlign: "center", height: "100%",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent2)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,77,0,0.04)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: "56px", height: "56px", borderRadius: "12px",
                background: "rgba(255,77,0,0.12)", border: "1px solid rgba(255,77,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Wrench size={28} color="var(--accent2)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>Seller</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.5, marginBottom: "20px" }}>
                List your parts to thousands of buyers. Admin-verified listings build trust.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--accent2)", fontSize: "13px", fontWeight: 600 }}>
                Start Selling <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}