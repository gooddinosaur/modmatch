"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

interface Listing {
  id: string | number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  ordersCount?: number;
  image_url?: string;
}

  interface OrderItem {
  id: string | number;
  partName: string;
  buyerId: string | number;
  buyerName?: string;
  amount_paid: number;
  quantity: number;
  status: "payment_held" | "shipped" | "confirmed" | "funds_released" | "refunded" | "reported";
  date: string;
  part_id?: string | number;
  part_image?: string;
  dispute_reason?: string;
  dispute_message?: string;
}

import { Package } from "lucide-react";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"listings" | "orders" | "new">("listings");
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Listing Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<OrderItem | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.token) return;
    try {
      // Fetch Listings
      const lsRes = await fetch(`${API}/seller/listings`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      let lsData = [];
      if (lsRes.ok) lsData = await lsRes.json();

      // Fetch Orders
      const ordRes = await fetch(`${API}/seller/orders`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      let ordData = [];
        if (ordRes.ok) {
          ordData = await ordRes.json();
        }

        // Format Orders
        const formattedOrders: OrderItem[] = ordData.map((o: any) => ({
          id: o.id,
          partName: o.part_name || `Part #${o.part_id}`,
          buyerId: o.buyer_id, // We'd ideally fetch buyer name, use ID for now
          buyerName: o.buyer_name || `Buyer #${o.buyer_id}`,
          amount_paid: o.amount_paid,
          quantity: o.quantity || 1,
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString(),
          part_id: o.part_id,
          part_image: o.part_image,
          dispute_reason: o.dispute_reason,
          dispute_message: o.dispute_message
        }));

        // Calculate orders count per listing
      const formattedListings: Listing[] = lsData.map((l: any) => {
        const matchingOrders = formattedOrders.filter((ord: any) => ord.part_id === l.id);
        return {
          id: l.id,
          name: l.name,
          description: l.description,
          price: l.price,
          quantity: l.quantity,
          status: l.status,
          ordersCount: matchingOrders.length,
          image_url: l.image_url
        };
      });

      setListings(formattedListings);
      setOrders(formattedOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!user?.token) return;
    if (newImages.length === 0) {
      alert("Please provide at least one image for your item.");
      return;
    }
    
    setIsUploading(true);
    try {
      // 1. Upload images
      const formData = new FormData();
      for (const file of newImages) {
        formData.append("files", file);
      }
      
      const uploadRes = await fetch(`${API}/seller/upload_images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user.token}` },
        body: formData
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload images.");
      }
      
      const { urls } = await uploadRes.json();
      
      // 2. Create listing
      const res = await fetch(`${API}/seller/listings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          price: Number.parseFloat(newPrice) || 0,
          quantity: Number.parseInt(newQuantity) || 1,
          brand: newBrand,
          category: newCategory,
          image_url: urls
        })
      });
      
      if (res.ok) {
        setNewName("");
        setNewDesc("");
        setNewPrice("");
        setNewBrand("");
        setNewCategory("");
        setNewImages([]);
        setTab("listings");
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during submission.");
    } finally {
      setIsUploading(false);
    }
  };

  const totalRevenue = orders.filter(o => ["confirmed", "funds_released"].includes(o.status)).reduce((s, o) => s + o.amount_paid, 0);
  const pendingOrders = orders.filter(o => ["payment_held", "shipped"].includes(o.status)).length;
  const pendingFunds = orders.filter(o => ["payment_held", "shipped"].includes(o.status)).reduce((s, o) => s + o.amount_paid, 0);

  if (loading) return <div style={{ padding: "48px 32px", textAlign: "center" }}>Loading Dashboard...</div>;

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
          { label: "Total Listings", value: listings.length },
          { label: "Active", value: listings.filter(l => l.status === "approved").length },
          { label: "Pending Review", value: listings.filter(l => l.status === "pending").length },
          { label: "Funds in Escrow", value: `฿${pendingFunds.toLocaleString()}` },
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
                {["Part Name", "Details", "Price", "Stock", "Orders", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {l.image_url ? (
                          <img 
                            src={l.image_url.split(",")[0].startsWith("/") ? `http://localhost:8000${l.image_url.split(",")[0]}` : l.image_url.split(",")[0]} 
                            alt={l.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        ) : (
                          <Package size={16} color="var(--muted)" />
                        )}
                      </div>
                      <span>{l.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.description || "-"}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--accent)" }}>฿{l.price.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px" }}>{l.quantity}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)" }}>{l.ordersCount || 0}</td>
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
              {orders.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: "13px", color: "var(--muted)" }}>{o.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {o.part_image ? (
                          <img 
                            src={o.part_image.split(",")[0].startsWith("/") ? `http://localhost:8000${o.part_image.split(",")[0]}` : o.part_image.split(",")[0]} 
                            alt={o.partName} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        ) : (
                          <Package size={16} color="var(--muted)" />
                        )}
                      </div>
                      <span>{o.partName} x {o.quantity}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{o.buyerName}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--accent)" }}>฿{o.amount_paid.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>{o.date}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <StatusBadge status={o.status} />
                        {o.status === "reported" && o.dispute_reason && (
                           <button 
                             className="btn-ghost" 
                             style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "100px", color: "var(--red)", borderColor: "rgba(255,61,61,0.3)" }}
                             onClick={() => setSelectedDispute(selectedDispute?.id === o.id ? null : o)}
                           >
                             {selectedDispute?.id === o.id ? "Hide Details" : "View Details"}
                           </button>
                        )}
                      </div>
                      
                      {selectedDispute?.id === o.id && (
                        <div style={{ marginTop: "4px", background: "rgba(255,61,61,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,61,61,0.2)", width: "100%", minWidth: "200px" }}>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", marginBottom: "4px" }}>Reason: {o.dispute_reason}</p>
                          {o.dispute_message && (
                            <p style={{ fontSize: "12px", color: "var(--muted)", whiteSpace: "pre-wrap", marginTop: "4px" }}>{o.dispute_message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
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
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. K&N Cold Air Intake" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Brand</label>
              <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="e.g. K&N" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Images (Max 10) *</label>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                {newImages.map((file, index) => (
                  <div key={index} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                      style={{
                        position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "white", 
                        border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", 
                        alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px", padding: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {newImages.length < 10 && (
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    width: "80px", height: "80px", borderRadius: "8px", border: "2px dashed var(--primary)",
                    background: "rgba(227, 26, 28, 0.05)", cursor: "pointer", color: "var(--primary)", transition: "all 0.2s"
                  }}>
                    <span style={{ fontSize: "24px", marginBottom: "4px" }}>+</span>
                    <span style={{ fontSize: "10px", fontWeight: 600 }}>ADD</span>
                    <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setNewImages(prev => {
                          const combined = [...prev, ...files];
                          if (combined.length > 10) {
                            alert("Maximum 10 images allowed");
                            return combined.slice(0, 10);
                          }
                          return combined;
                        });
                      }
                      // reset input to allow selecting same file again if removed
                      e.target.value = "";
                    }} />
                  </label>
                )}
              </div>
              
              {newImages.length > 0 && <span style={{ fontSize: "12px", color: "var(--muted)", margin: "0", display: "block" }}>{newImages.length} of 10 image(s) selected</span>}
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                <option value="">Select category...</option>
                <option value="Intake">Intake</option>
                <option value="Exhaust">Exhaust</option>
                <option value="Suspension">Suspension</option>
                <option value="Brakes">Brakes</option>
                <option value="Engine">Engine</option>
                <option value="Chassis">Chassis</option>
                <option value="Aero">Aero</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Description & Details</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brand, Category, Fits Honda Civic 2018–2020..." style={{
                background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)",
                padding: "10px 14px", borderRadius: "6px", fontFamily: "DM Sans, sans-serif",
                fontSize: "14px", width: "100%", minHeight: "100px", resize: "vertical", outline: "none",
              }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Price (฿)</label>
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Quantity</label>
              <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} placeholder="e.g. 1" min="1" />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button disabled={isUploading} className="btn-accent" style={{ flex: 1 }} onClick={handleCreateListing}>{isUploading ? "Uploading..." : "Submit for Review"}</button>
              <button disabled={isUploading} className="btn-ghost" onClick={() => setTab("listings")}>Cancel</button>
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