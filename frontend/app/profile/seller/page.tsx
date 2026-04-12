"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Store, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShopProfile {
  shopName: string; description: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string;
  lineId: string; facebook: string; specialties: string;
}

const INITIAL: ShopProfile = {
  shopName: "", description: "", phone: "",
  addressLine1: "", addressLine2: "", city: "",
  province: "", postalCode: "", lineId: "",
  facebook: "", specialties: "",
};

const Field = ({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (val: string) => void; placeholder?: string; multiline?: boolean;
}) => (
  <div>
    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
      {label}
    </label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px", borderRadius: "6px", fontFamily: "DM Sans, sans-serif", fontSize: "14px", width: "100%", minHeight: "100px", resize: "vertical", outline: "none" }} />
    ) : (
      <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    )}
  </div>
);

export default function SellerProfileEditPage() {
  const { user } = useAuth();
  const token = user?.token;
  const router = useRouter();
  const [draft, setDraft] = useState<ShopProfile>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/seller/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDraft({
            shopName: data.display_name || "",
            description: data.description || "",
            phone: data.phone || "",
            addressLine1: data.address?.address_line1 || "",
            addressLine2: data.address?.address_line2 || "",
            city: data.address?.city || "",
            province: data.address?.province || "",
            postalCode: data.address?.postal_code || "",
            lineId: data.line_id || "",
            facebook: data.facebook || "",
            specialties: data.specialties || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [API, token]);

  const handleSave = async () => {
    try {
      const payload = {
        display_name: draft.shopName || null,
        description: draft.description || null,
        phone: draft.phone || null,
        line_id: draft.lineId || null,
        facebook: draft.facebook || null,
        specialties: draft.specialties || null,
        address: {
          address_line1: draft.addressLine1 || null,
          address_line2: draft.addressLine2 || null,
          city: draft.city || null,
          province: draft.province || null,
          postal_code: draft.postalCode || null
        }
      };

      const res = await fetch(`${API}/seller/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          if (user?.id) {
            router.push(`/seller/${user.id}`);
          } else {
            router.push(`/seller/dashboard`);
          }
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 32px" }}>
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="display-font" style={{ fontSize: "48px", letterSpacing: "2px" }}>
            SHOP <span style={{ color: "var(--accent2)" }}>PROFILE</span>
          </h1>
          <p style={{ color: "var(--muted)" }}>{user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSave} style={{
            background: "var(--accent2)", color: "#fff", fontWeight: 600, padding: "8px 20px",
            borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            fontSize: "14px", display: "flex", alignItems: "center", gap: "6px",
          }}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.3)", borderRadius: "6px", padding: "12px 16px", color: "var(--green)", fontSize: "14px", marginBottom: "24px" }}>
          ✓ Profile updated successfully
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Store size={16} color="var(--accent2)" />
              <h2 style={{ fontSize: "15px", fontWeight: 600 }}>Shop Info</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Shop Name *" value={draft.shopName} onChange={v => setDraft({ ...draft, shopName: v })} placeholder="Your shop name" />
              <Field label="Description" value={draft.description} onChange={v => setDraft({ ...draft, description: v })} placeholder="Tell buyers about your shop..." multiline />
              <Field label="Specialties (comma separated)" value={draft.specialties} onChange={v => setDraft({ ...draft, specialties: v })} placeholder="Honda, JDM, Turbo Systems..." />
            </div>
          </div>
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Contact</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Email</label>
                <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {user?.email}
                </div>
                <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>Email cannot be changed</p>
              </div>
              <Field label="Phone" value={draft.phone} onChange={v => setDraft({ ...draft, phone: v })} placeholder="08X-XXX-XXXX" />
              <Field label="LINE ID" value={draft.lineId} onChange={v => setDraft({ ...draft, lineId: v })} placeholder="@yourshop" />
              <Field label="Facebook" value={draft.facebook} onChange={v => setDraft({ ...draft, facebook: v })} placeholder="facebook.com/yourshop" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Shop Address</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Address Line 1" value={draft.addressLine1} onChange={v => setDraft({ ...draft, addressLine1: v })} placeholder="Building / Street" />
              <Field label="Address Line 2" value={draft.addressLine2} onChange={v => setDraft({ ...draft, addressLine2: v })} placeholder="Subdistrict / District" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="City" value={draft.city} onChange={v => setDraft({ ...draft, city: v })} placeholder="Bangkok" />
                <Field label="Province" value={draft.province} onChange={v => setDraft({ ...draft, province: v })} placeholder="Bangkok" />
              </div>
              <Field label="Postal Code" value={draft.postalCode} onChange={v => setDraft({ ...draft, postalCode: v })} placeholder="10110" />
            </div>
          </div>
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Account Status</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Role", value: "Seller", color: "var(--accent2)", bg: "rgba(255,77,0,0.12)" },
                { label: "Verification", value: "Verified", color: "var(--green)", bg: "rgba(0,230,118,0.12)" },
                { label: "Listings Active", value: "3", color: "var(--text)", bg: "var(--surface2)" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>{item.label}</span>
                  <span style={{ background: item.bg, color: item.color, fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
