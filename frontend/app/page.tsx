"use client";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, Wrench, CarFront } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "seller") {
        router.push("/seller/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/search");
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null; // Or a loading spinner, prevent flash of landing page
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: "100px 64px",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "40px", right: "64px",
          width: "480px", height: "480px",
          background: "radial-gradient(circle, rgba(232,255,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "24px" }}>
          Verified Fitment - Escrow Protection
        </p>
        <h1 className="display-font" style={{ fontSize: "clamp(60px, 10vw, 120px)", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "32px" }}>
          THE RIGHT<br />
          <span style={{ color: "var(--accent)" }}>PART.</span><br />
          EVERY TIME.
        </h1>
        <p style={{ maxWidth: "520px", color: "var(--muted)", fontSize: "17px", lineHeight: 1.7, marginBottom: "40px" }}>
          ModMatch guarantees every part fits your exact vehicle - and holds your payment safe until you confirm it does. No more expensive mistakes.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/register/buyer">
            <button className="btn-accent" style={{ fontSize: "16px", padding: "14px 32px" }}>Find Parts for My Car</button>
          </Link>
          <Link href="/register/seller">
            <button className="btn-ghost" style={{ fontSize: "16px", padding: "14px 32px" }}>Start Selling</button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{
        borderTop: "1px solid var(--border)",
        padding: "80px 64px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <h2 className="display-font" style={{ fontSize: "48px", letterSpacing: "2px", marginBottom: "48px", color: "var(--muted)" }}>
          HOW IT WORKS
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {[
            { step: "01", title: "Add Your Car", desc: "Enter your make, model, and year. We match parts that fit - guaranteed." },
            { step: "02", title: "Browse & Buy", desc: "Admin-verified listings only. Funds held in escrow until you confirm fitment." },
            { step: "03", title: "Receive & Confirm", desc: "Part arrives. Fits perfectly. Confirm - seller gets paid. Simple." },
            { step: "04", title: "Problem? We Fix It", desc: "Doesn't fit? Funds held. Admin resolves disputes fairly and fast." },
          ].map(item => (
            <div key={item.step} className="card" style={{ padding: "28px" }}>
              <span className="display-font" style={{ fontSize: "48px", color: "var(--accent)", opacity: 0.4, lineHeight: 1 }}>
                {item.step}
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "12px 0 8px" }}>{item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section style={{
        borderTop: "1px solid var(--border)",
        padding: "60px 64px",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        gap: "48px",
        flexWrap: "wrap",
      }}>
        {[
          { icon: <ShieldCheck size={36} color="var(--accent)" strokeWidth={1.5} />, label: "Escrow Protection", sub: "Money held until confirmed" },
          { icon: <BadgeCheck size={36} color="var(--green)" strokeWidth={1.5} />, label: "Admin-Verified Parts", sub: "Every listing checked" },
          { icon: <Wrench size={36} color="#a1a1aa" strokeWidth={1.5} />, label: "Fitment Guarantee", sub: "Matches your exact vehicle" },
          { icon: <CarFront size={36} color="#60a5fa" strokeWidth={1.5} />, label: "Master Car Database", sub: "Thousands of makes & models" },
        ].map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>{b.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{b.label}</div>
              <div style={{ color: "var(--muted)", fontSize: "13px" }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}