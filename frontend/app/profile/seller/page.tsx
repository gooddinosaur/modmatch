"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Store, Edit3, Save, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ShopProfile {
  shopName: string; description: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string;
  lineId: string; facebook: string; specialties: string;
}

const INITIAL: ShopProfile = {
  shopName: "TurboGarage BKK",
  description: "Bangkok's premier JDM performance parts dealer. Specializing in Honda, Toyota, and Subaru performance upgrades.",
  phone: "081-234-5678",
  addressLine1: "456/78 Rama 9 Road", addressLine2: "Huai Khwang",
  city: "Bangkok", province: "Bangkok", postalCode: "10310",
  lineId: "@turbogaragebkk", facebook: "facebook.com/turbogaragebkk",
  specialties: "Honda, Toyota, Subaru, JDM Parts, Turbo Systems",
};

export default function SellerProfileEditPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ShopProfile>(INITIAL);
  const [draft, setDraft] = useState<ShopProfile>(INITIAL);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, value, field, placeholder, multiline }: {
    label: string; value: string; field: keyof ShopProfile; placeholder?: string; multiline?: boolean;
  }) => (
    <div>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {editing ? (
        multiline ? (
          <textarea value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })} placeholder={placeholder}
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px", borderRadius: "6px", fontFamily: "DM Sans, sans-serif", fontSize: "14px", width: "100%", minHeight: "100px", resize: "vertical", outline: "none" }} />
        ) : (
          <input value={draft[field]} placeholder={placeholder} onChange={e => setDraft({ ...draft, [field]: e.target.value })} />
        )
      ) : (
        <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)", color: value ? "var(--text)" : "var(--muted)", minHeight: multiline ? "80px" : "auto", lineHeight: 1.6 }}>
          {value || "—"}
        </div>
      )}
    </div>
  );

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
          <Link href="/seller/seller_1" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
              <ExternalLink size={13} /> View Public Profile
            </button>
          </Link>
          {!editing ? (
            <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => { setDraft(profile); setEditing(true); }}>
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
                onClick={() => { setDraft(profile); setEditing(false); }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} style={{
                background: "var(--accent2)", color: "#fff", fontWeight: 600, padding: "8px 20px",
                borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                fontSize: "14px", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <Save size={14} /> Save
              </button>
            </div>
          )}
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
              <Field label="Shop Name *" value={profile.shopName} field="shopName" placeholder="Your shop name" />
              <Field label="Description" value={profile.description} field="description" placeholder="Tell buyers about your shop..." multiline />
              <Field label="Specialties (comma separated)" value={profile.specialties} field="specialties" placeholder="Honda, JDM, Turbo Systems..." />
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
              <Field label="Phone" value={profile.phone} field="phone" placeholder="08X-XXX-XXXX" />
              <Field label="LINE ID" value={profile.lineId} field="lineId" placeholder="@yourshop" />
              <Field label="Facebook" value={profile.facebook} field="facebook" placeholder="facebook.com/yourshop" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Shop Address</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Address Line 1" value={profile.addressLine1} field="addressLine1" placeholder="Building / Street" />
              <Field label="Address Line 2" value={profile.addressLine2} field="addressLine2" placeholder="Subdistrict / District" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="City" value={profile.city} field="city" placeholder="Bangkok" />
                <Field label="Province" value={profile.province} field="province" placeholder="Bangkok" />
              </div>
              <Field label="Postal Code" value={profile.postalCode} field="postalCode" placeholder="10110" />
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