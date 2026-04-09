"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, MapPin, Car, Edit3, Save, X, Plus, Trash2 } from "lucide-react";

interface Address {
  id: string; label: string; isDefault: boolean;
  firstName: string; lastName: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string;
}

interface Vehicle {
  id: string; make: string; model: string; year: string; subModel: string;
}

const MAKES = ["Honda", "Toyota", "Mazda", "Subaru", "Nissan", "Mitsubishi", "BMW", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Other"];

const MOCK_ADDRESSES: Address[] = [{
  id: "addr_1", label: "Home", isDefault: true,
  firstName: "Somchai", lastName: "Rakpong", phone: "081-234-5678",
  addressLine1: "123/45 Sukhumvit Soi 11", addressLine2: "Khlong Toei Nuea, Watthana",
  city: "Bangkok", province: "Bangkok", postalCode: "10110",
}];

const MOCK_VEHICLES: Vehicle[] = [
  { id: "v1", make: "Honda", model: "Civic Type R", year: "2020", subModel: "FK8" },
];

export default function BuyerProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "vehicles">("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("Somchai Rakpong");
  const [phone, setPhone] = useState("081-234-5678");

  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "isDefault">>({
    label: "", firstName: "", lastName: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", province: "", postalCode: "",
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, "id">>({ make: "", model: "", year: "", subModel: "" });

  const addAddress = () => {
    setAddresses([...addresses, { ...newAddr, id: `addr_${Date.now()}`, isDefault: addresses.length === 0 }]);
    setNewAddr({ label: "", firstName: "", lastName: "", phone: "", addressLine1: "", addressLine2: "", city: "", province: "", postalCode: "" });
    setShowAddAddr(false);
  };

  const addVehicle = () => {
    setVehicles([...vehicles, { ...newVehicle, id: `v_${Date.now()}` }]);
    setNewVehicle({ make: "", model: "", year: "", subModel: "" });
    setShowAddVehicle(false);
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
                onClick={() => setEditingProfile(false)}>
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
                        onClick={() => setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === addr.id })))}>
                        Set Default
                      </button>
                    )}
                    <button className="btn-ghost" style={{ padding: "6px 10px", color: "var(--red)", borderColor: "rgba(255,61,61,0.3)" }}
                      onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))}>
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
                    onClick={() => setVehicles(vehicles.filter(x => x.id !== v.id))}>
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
    </div>
  );
}