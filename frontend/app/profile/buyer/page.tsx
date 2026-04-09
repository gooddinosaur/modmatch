"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, MapPin, Car, Edit3, Save, X, Plus, Trash2, Package } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface Address {
  id: string | number; label: string; isDefault: boolean;
  firstName: string; lastName: string; phone: string;
  addressLine1: string; addressLine2?: string;
  city: string; province: string; postalCode: string;
}

interface Vehicle {
  id: string | number; make: string; model: string; year: string; subModel?: string;
}

const MAKES = ["Honda", "Toyota", "Mazda", "Subaru", "Nissan", "Mitsubishi", "BMW", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Other"];

export default function BuyerProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "vehicles" | "orders">("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "isDefault">>({
    label: "", firstName: "", lastName: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", province: "", postalCode: "",
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, "id">>({ make: "", model: "", year: "", subModel: "" });

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = user?.token;
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/v1/buyer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDisplayName(data.display_name || "");
        setPhone(data.phone || "");
      }
      
      const addressesRes = await fetch("http://localhost:8000/api/v1/buyer/addresses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (addressesRes.ok) {
        const a = await addressesRes.json();
        setAddresses(a.map((item: any) => ({
          id: item.id, label: item.label, isDefault: item.is_default,
          firstName: item.first_name, lastName: item.last_name, phone: item.phone,
          addressLine1: item.address_line1, addressLine2: item.address_line2,
          city: item.city, province: item.province, postalCode: item.postal_code
        })));
      }
      
      const ordersRes = await fetch("http://localhost:8000/api/v1/buyer/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }

      const vehRes = await fetch("http://localhost:8000/api/v1/buyer/vehicles", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (vehRes.ok) {
        const v = await vehRes.json();
        setVehicles(v.map((item: any) => ({
          id: item.id, make: item.make, model: item.model, year: item.year, subModel: item.sub_model
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/v1/buyer/profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, phone: phone })
      });
      if (res.ok) {
        setEditingProfile(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addAddress = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/v1/buyer/addresses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newAddr.label, first_name: newAddr.firstName, last_name: newAddr.lastName,
          phone: newAddr.phone, address_line1: newAddr.addressLine1, address_line2: newAddr.addressLine2,
          city: newAddr.city, province: newAddr.province, postal_code: newAddr.postalCode
        })
      });
      if (res.ok) {
        fetchProfileData();
        setNewAddr({ label: "", firstName: "", lastName: "", phone: "", addressLine1: "", addressLine2: "", city: "", province: "", postalCode: "" });
        setShowAddAddr(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAddress = async (id: string | number) => {
    try {
      const token = user?.token;
      if (!token) return;
      await fetch(`http://localhost:8000/api/v1/buyer/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultAddress = async (id: string | number) => {
    try {
      const token = user?.token;
      if (!token) return;
      await fetch(`http://localhost:8000/api/v1/buyer/addresses/${id}/default`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const addVehicle = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/v1/buyer/vehicles", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          make: newVehicle.make, model: newVehicle.model,
          year: newVehicle.year, sub_model: newVehicle.subModel
        })
      });
      if (res.ok) {
        fetchProfileData();
        setNewVehicle({ make: "", model: "", year: "", subModel: "" });
        setShowAddVehicle(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVehicle = async (id: string | number) => {
    try {
      const token = user?.token;
      if (!token) return;
      await fetch(`http://localhost:8000/api/v1/buyer/vehicles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 className="display-font" style={{ fontSize: "48px", letterSpacing: "2px" }}>
          MY <span style={{ color: "var(--accent)" }}>PROFILE</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>{user?.email}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", borderBottom: "1px solid var(--border)" }}>
        {([
          { key: "profile", label: "Account", icon: <User size={14} /> },
          { key: "addresses", label: `Addresses (${addresses.length})`, icon: <MapPin size={14} /> },
          { key: "vehicles", label: `My Cars (${vehicles.length})`, icon: <Car size={14} /> },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            background: "none", border: "none",
            color: activeTab === t.key ? "var(--accent)" : "var(--muted)",
            cursor: "pointer", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            borderBottom: activeTab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
        <button onClick={() => setActiveTab("orders")} style={{
            background: "none", border: "none",
            color: activeTab === "orders" ? "var(--accent)" : "var(--muted)",
            cursor: "pointer", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            borderBottom: activeTab === "orders" ? "2px solid var(--accent)" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <Package size={14} /> Orders
          </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card" style={{ padding: "32px", maxWidth: "480px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 600 }}>Account Details</h2>
            <button className="btn-ghost" style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
              onClick={() => setEditingProfile(!editingProfile)}>
              {editingProfile ? <><X size={13} /> Cancel</> : <><Edit3 size={13} /> Edit</>}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Email</label>
              <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "6px", fontSize: "14px", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {user?.email}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>Email cannot be changed</p>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Display Name</label>
              {editingProfile
                ? <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
                : <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)" }}>{displayName}</div>
              }
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Phone</label>
              {editingProfile
                ? <input value={phone} onChange={e => setPhone(e.target.value)} />
                : <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)" }}>{phone || "—"}</div>
              }
            </div>
            {editingProfile && (
              <button className="btn-accent" style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onClick={() => saveProfile()}>
                <Save size={15} /> Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
            {addresses.map(addr => (
              <div key={addr.id} className="card" style={{ padding: "20px", borderColor: addr.isDefault ? "rgba(232,255,0,0.3)" : "var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{addr.label || "Address"}</span>
                      {addr.isDefault && (
                        <span style={{ background: "rgba(232,255,0,0.12)", color: "var(--accent)", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px" }}>{addr.firstName} {addr.lastName}</p>
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p style={{ fontSize: "13px", color: "var(--muted)" }}>{addr.addressLine2}</p>}
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>{addr.city}, {addr.province} {addr.postalCode}</p>
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>{addr.phone}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!addr.isDefault && (
                      <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => setDefaultAddress(addr.id)}>
                        Set Default
                      </button>
                    )}
                    <button className="btn-ghost" style={{ padding: "6px 10px", color: "var(--red)", borderColor: "rgba(255,61,61,0.3)" }}
                      onClick={() => deleteAddress(addr.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddAddr ? (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Add New Address</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Label</label>
                  <input placeholder="e.g. Home, Office" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>First Name</label>
                    <input value={newAddr.firstName} onChange={e => setNewAddr({ ...newAddr, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Last Name</label>
                    <input value={newAddr.lastName} onChange={e => setNewAddr({ ...newAddr, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Phone</label>
                  <input value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Address</label>
                  <input placeholder="Line 1" value={newAddr.addressLine1} onChange={e => setNewAddr({ ...newAddr, addressLine1: e.target.value })} style={{ marginBottom: "8px" }} />
                  <input placeholder="Line 2 (optional)" value={newAddr.addressLine2} onChange={e => setNewAddr({ ...newAddr, addressLine2: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>City</label>
                    <input value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Province</label>
                    <input value={newAddr.province} onChange={e => setNewAddr({ ...newAddr, province: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Postal</label>
                    <input value={newAddr.postalCode} onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-ghost" onClick={() => setShowAddAddr(false)}>Cancel</button>
                  <button className="btn-accent" style={{ flex: 1 }} onClick={addAddress}>Save Address</button>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => setShowAddAddr(true)}>
              <Plus size={15} /> Add New Address
            </button>
          )}
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === "vehicles" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
            {vehicles.map(v => (
              <div key={v.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
                      {v.year} {v.make} {v.model}
                      {v.subModel && <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {v.subModel}</span>}
                    </div>
                    <span style={{ display: "inline-block", padding: "2px 10px", background: "rgba(232,255,0,0.08)", borderRadius: "4px", fontSize: "12px", color: "var(--accent)" }}>
                      {v.make}
                    </span>
                  </div>
                  <button className="btn-ghost" style={{ padding: "6px 10px", color: "var(--red)", borderColor: "rgba(255,61,61,0.3)" }}
                    onClick={() => deleteVehicle(v.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddVehicle ? (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Add Vehicle</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Make</label>
                  <select value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })}>
                    <option value="">Select Make</option>
                    {MAKES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Model</label>
                    <input placeholder="e.g. Civic, GR86" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Year</label>
                    <input type="number" placeholder="2020" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Sub-Model / Trim (optional)</label>
                  <input placeholder="e.g. Type R, GT, Sport" value={newVehicle.subModel} onChange={e => setNewVehicle({ ...newVehicle, subModel: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-ghost" onClick={() => setShowAddVehicle(false)}>Cancel</button>
                  <button className="btn-accent" style={{ flex: 1 }} onClick={addVehicle}>Add Vehicle</button>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => setShowAddVehicle(true)}>
              <Plus size={15} /> Add Vehicle
            </button>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "24px" }}>My Orders</h3>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", backgroundColor: "var(--background)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
              <Package size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                       <div style={{ fontSize: "14px", fontWeight: 600 }}>Order #{order.id}</div>
                       <div style={{ fontSize: "12px", color: "var(--muted)" }}>Placed on {new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={order.status.toLowerCase()} />
                  </div>
                  <div style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "var(--background)", borderRadius: "8px", flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>{order.part?.name || "Order #" + order.id}</h4>
                        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>Seller: {order.seller_name}</p>
                        <div style={{ fontWeight: 700 }}>${(order.amount_paid || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}