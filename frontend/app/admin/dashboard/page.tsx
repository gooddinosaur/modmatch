"use client";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

const PENDING_LISTINGS = [
  { id: "L-003", name: "Tomei Expreme Ti Exhaust", brand: "Tomei", seller: "JDMPartsPro", category: "Exhaust", price: 32000, fitment: "Nissan Silvia S15", submitted: "2025-03-21" },
  { id: "L-007", name: "Apexi Power FC ECU", brand: "Apexi", seller: "TurboGarage_BKK", category: "Engine", price: 55000, fitment: "Toyota Supra JZA80", submitted: "2025-03-22" },
];

const DISPUTED_ORDERS = [
  { id: "ORD-009", part: "Bilstein B6 Shock Set", buyer: "user_preeda", seller: "JDMPartsPro", amount: 24000, issue: "Part doesn't fit — wrong year variant shipped", date: "2025-03-19" },
];

const RECENT_APPROVALS = [
  { id: "L-001", name: "Cold Air Intake Kit", action: "approved" as const, date: "2025-03-20" },
  { id: "L-002", name: "Cusco Strut Tower Bar", action: "approved" as const, date: "2025-03-19" },
  { id: "L-005", name: "Fake Brand Coilovers", action: "rejected" as const, date: "2025-03-18" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<"review" | "disputes" | "log">("review");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
          <h1 className="display-font" style={{ fontSize: "48px", letterSpacing: "2px" }}>
            ADMIN <span style={{ color: "var(--accent2)" }}>DASHBOARD</span>
          </h1>
          <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--accent2)", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px" }}>
            RESTRICTED
          </span>
        </div>
        <p style={{ color: "var(--muted)" }}>Review listings, resolve disputes, manage platform integrity</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {[
          { label: "Pending Review", value: PENDING_LISTINGS.length, color: "var(--yellow)" },
          { label: "Open Disputes", value: DISPUTED_ORDERS.length, color: "var(--red)" },
          { label: "Approved Today", value: 2, color: "var(--green)" },
          { label: "Total Listings", value: 148, color: "var(--text)" },
          { label: "Active Orders", value: 37, color: "var(--text)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px" }}>
            <div style={{ color: "var(--muted)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        {(["review", "disputes", "log"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none",
            color: tab === t ? "var(--accent2)" : "var(--muted)",
            cursor: "pointer", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
            textTransform: "capitalize", fontFamily: "DM Sans, sans-serif",
            borderBottom: tab === t ? `2px solid var(--accent2)` : "2px solid transparent",
          }}>
            {t === "review" ? `Pending Review (${PENDING_LISTINGS.length})` : t === "disputes" ? `Disputes (${DISPUTED_ORDERS.length})` : "Activity Log"}
          </button>
        ))}
      </div>

      {/* Review tab */}
      {tab === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {PENDING_LISTINGS.map(l => (
            <div key={l.id} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>{l.id}</span>
                    <StatusBadge status="pending" />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "4px" }}>{l.name}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                    {l.brand} · {l.category} · by <strong style={{ color: "var(--text)" }}>{l.seller}</strong>
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "6px" }}>
                    Fitment: {l.fitment} · Submitted: {l.submitted}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>฿{l.price.toLocaleString()}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ padding: "8px 20px", color: "var(--red)", borderColor: "var(--red)" }}>
                      Reject
                    </button>
                    <button className="btn-accent" style={{ padding: "8px 20px", background: "var(--green)", color: "#000" }}>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {PENDING_LISTINGS.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
              ✅ All caught up — no listings pending review.
            </div>
          )}
        </div>
      )}

      {/* Disputes tab */}
      {tab === "disputes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {DISPUTED_ORDERS.map(d => (
            <div key={d.id} className="card" style={{ padding: "24px", borderColor: "rgba(255,61,61,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>{d.id}</span>
                    <span style={{ background: "rgba(255,61,61,0.15)", color: "var(--red)", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>DISPUTE</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>{d.part}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "8px" }}>
                    Buyer: <strong style={{ color: "var(--text)" }}>{d.buyer}</strong> · Seller: <strong style={{ color: "var(--text)" }}>{d.seller}</strong>
                  </p>
                  <div style={{ background: "rgba(255,61,61,0.08)", border: "1px solid rgba(255,61,61,0.2)", borderRadius: "6px", padding: "10px 14px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text)" }}>"{d.issue}"</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--yellow)" }}>฿{d.amount.toLocaleString()} HELD</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: "13px" }}>Refund Buyer</button>
                    <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: "13px", color: "var(--green)", borderColor: "var(--green)" }}>Release to Seller</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log tab */}
      {tab === "log" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Listing ID", "Part Name", "Action", "Date"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_APPROVALS.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < RECENT_APPROVALS.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: "13px", color: "var(--muted)" }}>{r.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: "16px 20px" }}><StatusBadge status={r.action} /></td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}