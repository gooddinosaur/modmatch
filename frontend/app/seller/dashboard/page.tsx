"use client";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

const MOCK_LISTINGS = [
  { id: "1", name: "Cold Air Intake Kit", category: "Intake", price: 8500, status: "approved" as const, orders: 3, fitment: "Honda Civic 2018–2020" },
  { id: "2", name: "HKS Intercooler Kit", category: "Intake", price: 18500, status: "approved" as const, orders: 1, fitment: "Subaru WRX 2018–2022" },
  { id: "3", name: "Tomei Expreme Ti Exhaust", category: "Exhaust", price: 32000, status: "pending" as const, orders: 0, fitment: "Nissan Silvia S15" },
];

const MOCK_ORDERS = [
  { id: "ORD-001", part: "Cold Air Intake Kit", buyer: "user_kawin", amount: 8500, status: "shipped" as const, date: "2025-03-20" },
  { id: "ORD-002", part: "HKS Intercooler Kit", buyer: "user_mint", amount: 18500, status: "held" as const, date: "2025-03-18" },
  { id: "ORD-003", part: "Cold Air Intake Kit", buyer: "user_somchai", amount: 8500, status: "confirmed" as const, date: "2025-03-10" },
];

export default function SellerDashboard() {
  const [tab, setTab] = useState<"listings" | "orders" | "new">("listings");

  const totalRevenue = MOCK_ORDERS.filter(o => o.status === "confirmed").reduce((s, o) => s + o.amount, 0);
  const pending = MOCK_ORDERS.filter(o => o.status === "held").length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 className="display-font" style={{ fontSize: "48px", letterSpacing: "2px" }}>
          SELLER <span style={{ color: "var(--accent)" }}>DASHBOARD</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>Manage your listings and track orders</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {[
          { label: "Total Listings", value: MOCK_LISTINGS.length },
          { label: "Active", value: MOCK_LISTINGS.filter(l => l.status === "approved").length },
          { label: "Pending Review", value: MOCK_LISTINGS.filter(l => l.status === "pending").length },
          { label: "Funds in Escrow", value: `฿${(pending * 18500).toLocaleString()}` },
          { label: "Confirmed Revenue", value: `฿${totalRevenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px" }}>
            <div style={{ color: "var(--muted)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
        {(["listings", "orders", "new"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none",
            border: "none",
            color: tab === t ? "var(--accent)" : "var(--muted)",
            cursor: "pointer",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "capitalize",
            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            fontFamily: "DM Sans, sans-serif",
          }}>
            {t === "new" ? "+ New Listing" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === "listings" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Part Name", "Category", "Fitment", "Price", "Orders", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LISTINGS.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: i < MOCK_LISTINGS.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>{l.name}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{l.category}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{l.fitment}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--accent)" }}>฿{l.price.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)" }}>{l.orders}</td>
                  <td style={{ padding: "16px 20px" }}><StatusBadge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Order ID", "Part", "Buyer", "Amount", "Date", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < MOCK_ORDERS.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: "13px", color: "var(--muted)" }}>{o.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>{o.part}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{o.buyer}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--accent)" }}>฿{o.amount.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{o.date}</td>
                  <td style={{ padding: "16px 20px" }}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Listing tab */}
      {tab === "new" && (
        <div className="card" style={{ padding: "32px", maxWidth: "600px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Create New Listing</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Part Name</label>
              <input placeholder="e.g. K&N Cold Air Intake" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Brand</label>
              <input placeholder="e.g. K&N" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Category</label>
              <select>
                <option>Intake</option><option>Exhaust</option><option>Suspension</option>
                <option>Brakes</option><option>Engine</option><option>Chassis</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Compatible Vehicles (one per line)</label>
              <textarea placeholder={"Honda Civic 2018\nHonda Civic 2019"} style={{
                background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)",
                padding: "10px 14px", borderRadius: "6px", fontFamily: "DM Sans, sans-serif",
                fontSize: "14px", width: "100%", minHeight: "100px", resize: "vertical", outline: "none",
              }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Price (฿)</label>
              <input type="number" placeholder="0" />
            </div>
            <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
              <button className="btn-accent" style={{ flex: 1 }}>Submit for Review</button>
              <button className="btn-ghost">Cancel</button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              ⓘ Listings are reviewed by an admin before going live. This typically takes 1–2 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}