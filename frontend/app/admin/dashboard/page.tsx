"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

interface PendingListing {
  id: number;
  name: string;
  description: string;
  price: number;
  seller_id: number;
  status: string;
  created_at: string;
}

interface DisputedOrder {
  id: number;
  part_id: number;
  buyer_id: number;
  amount_paid: number;
  created_at: string;
  status: string;
}

interface AdminStats {
  pending_listings: number;
  active_listings: number;
  disputed_orders: number;
  active_orders: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"review" | "disputes" | "active" | "log">("review");
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [disputedOrders, setDisputedOrders] = useState<DisputedOrder[]>([]);
  const [activeListings, setActiveListings] = useState<PendingListing[]>([]);
  const [activityLog, setActivityLog] = useState<PendingListing[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    if (!user?.token) return;
    try {
      const headers = { "Authorization": `Bearer ${user.token}` };

      const [statsRes, partsRes, ordersRes, activeRes, logRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/parts/pending`, { headers }),
        fetch(`${API}/admin/orders/reported`, { headers }),
        fetch(`${API}/admin/parts/active`, { headers }),
        fetch(`${API}/admin/parts/log`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (partsRes.ok) setPendingListings(await partsRes.json());
      if (ordersRes.ok) setDisputedOrders(await ordersRes.json());
      if (activeRes.ok) setActiveListings(await activeRes.json());
      if (logRes.ok) setActivityLog(await logRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePartStatus = async (partId: number, status: "approved" | "rejected") => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API}/admin/parts/${partId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData(); // Refresh list after status update
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveOrder = async (orderId: number, action: "refund" | "release") => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API}/admin/orders/${orderId}/resolve?resolve_action=${action}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchAdminData(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePart = async (partId: number) => {
    if (!user?.token) return;
    if (!globalThis.confirm(`Are you sure you want to delete Listing L-${partId}?`)) return;
    try {
      const res = await fetch(`${API}/admin/parts/${partId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: "48px 32px", textAlign: "center" }}>Loading Admin Data...</div>;

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
          { label: "Pending Review", value: stats?.pending_listings || 0, color: "var(--yellow)" },
          { label: "Active Listings", value: stats?.active_listings || 0, color: "var(--text)" },
          { label: "Open Disputes", value: stats?.disputed_orders || 0, color: "var(--red)" },
          { label: "Active Orders", value: stats?.active_orders || 0, color: "var(--green)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px" }}>
            <div style={{ color: "var(--muted)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        {(["review", "disputes", "active", "log"] as const).map(t => {
          let tabLabel = "Activity Log";
          if (t === "review") tabLabel = `Pending Review (${pendingListings.length})`;
          if (t === "disputes") tabLabel = `Disputes (${disputedOrders.length})`;
          if (t === "active") tabLabel = `Active Listings (${activeListings.length})`;

          return (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none",
              color: tab === t ? "var(--accent2)" : "var(--muted)",
              cursor: "pointer", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
              textTransform: "capitalize", fontFamily: "DM Sans, sans-serif",
              borderBottom: tab === t ? `2px solid var(--accent2)` : "2px solid transparent",
            }}>
              {tabLabel}
            </button>
          )
        })}
      </div>

      {/* Review tab */}
      {tab === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingListings.map(l => (
            <div key={l.id} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>L-{l.id}</span>
                    <StatusBadge status="pending" />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "4px" }}>{l.name}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                    by Seller #{l.seller_id}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "6px", maxWidth: "600px" }}>
                    {l.description || "No description provided"} · Submitted: {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>฿{l.price.toLocaleString()}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ padding: "8px 20px", color: "var(--red)", borderColor: "var(--red)" }} onClick={() => handleUpdatePartStatus(l.id, "rejected")}>
                      Reject
                    </button>
                    <button className="btn-accent" style={{ padding: "8px 20px", background: "var(--green)", color: "#000" }} onClick={() => handleUpdatePartStatus(l.id, "approved")}>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {pendingListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
              ✅ All caught up — no listings pending review.
            </div>
          )}
        </div>
      )}

      {/* Disputes tab */}
      {tab === "disputes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {disputedOrders.map(d => (
            <div key={d.id} className="card" style={{ padding: "24px", borderColor: "rgba(255,61,61,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>ORD-{d.id}</span>
                    <span style={{ background: "rgba(255,61,61,0.15)", color: "var(--red)", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>DISPUTE</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>Part #{d.part_id}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "8px" }}>
                    Buyer: <strong style={{ color: "var(--text)" }}>User #{d.buyer_id}</strong>
                  </p>
                  <div style={{ background: "rgba(255,61,61,0.08)", border: "1px solid rgba(255,61,61,0.2)", borderRadius: "6px", padding: "10px 14px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text)" }}>Reported on {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--yellow)" }}>฿{d.amount_paid.toLocaleString()} HELD</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: "13px" }} onClick={() => handleResolveOrder(d.id, "refund")}>Refund Buyer</button>
                    <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: "13px", color: "var(--green)", borderColor: "var(--green)" }} onClick={() => handleResolveOrder(d.id, "release")}>Release to Seller</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {disputedOrders.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
              🎉 Excellent — no active order disputes to resolve.
            </div>
          )}
        </div>
      )}

      {/* Active tab */}
      {tab === "active" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeListings.map(l => (
            <div key={l.id} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>L-{l.id}</span>
                    <StatusBadge status="approved" />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "4px" }}>{l.name}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                    by Seller #{l.seller_id}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "6px", maxWidth: "600px" }}>
                    {l.description || "No description provided"} · Listed on: {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>฿{l.price.toLocaleString()}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ padding: "8px 20px", color: "var(--red)", borderColor: "var(--red)" }} onClick={() => handleDeletePart(l.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activeListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
              No active listings currently on the platform.
            </div>
          )}
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
              {activityLog.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < activityLog.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: "13px", color: "var(--muted)" }}>L-{r.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <StatusBadge status={r.status as "approved" | "rejected" | "pending"} />
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {activityLog.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--muted)" }}>No recent activity to show.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}