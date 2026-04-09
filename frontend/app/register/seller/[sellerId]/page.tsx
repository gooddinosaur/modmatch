"use client";
import { useState } from "react";
import PartCard, { Part } from "@/components/PartCard";
import { MapPin, Phone, MessageCircle, Globe } from "lucide-react";

const SELLER = {
  id: "seller_1",
  shopName: "TurboGarage BKK",
  description: "Bangkok's premier JDM performance parts dealer. Specializing in Honda, Toyota, and Subaru performance upgrades. Over 8 years of experience. All parts are genuine or OEM-spec quality.",
  phone: "081-234-5678",
  lineId: "@turbogaragebkk",
  facebook: "facebook.com/turbogaragebkk",
  city: "Bangkok",
  province: "Bangkok",
  joinedDate: "2022-03-15",
  totalSales: 142,
  rating: 4.8,
  reviewCount: 89,
  verified: true,
  specialties: ["Honda", "Toyota", "Subaru", "JDM Parts", "Turbo Systems", "Suspension"],
};

const SELLER_LISTINGS: Part[] = [
  { id: "1", name: "Cold Air Intake Kit", brand: "K&N", price: 8500, fitment: ["Honda Civic 2018–2020"], status: "approved", category: "Intake", seller: "TurboGarage_BKK" },
  { id: "2", name: "HKS Intercooler Kit", brand: "HKS", price: 18500, fitment: ["Subaru WRX 2018–2022"], status: "approved", category: "Intake", seller: "TurboGarage_BKK" },
  { id: "3", name: "Cusco Strut Tower Bar", brand: "Cusco", price: 6200, fitment: ["Honda Civic 2016–2021"], status: "approved", category: "Chassis", seller: "TurboGarage_BKK" },
  { id: "4", name: "Brembo Sport Brake Pads", brand: "Brembo", price: 4800, fitment: ["Toyota GR86 2022"], status: "approved", category: "Brakes", seller: "TurboGarage_BKK" },
];

const REVIEWS = [
  { id: 1, buyer: "user_somchai", rating: 5, comment: "Received genuine K&N filter, fast shipping, great packaging!", date: "2025-03-10", part: "Cold Air Intake Kit" },
  { id: 2, buyer: "user_mint", rating: 5, comment: "HKS intercooler fits perfectly. Exactly as described.", date: "2025-02-28", part: "HKS Intercooler Kit" },
  { id: 3, buyer: "user_preeda", rating: 4, comment: "Good parts, slightly delayed shipping but seller communicated well.", date: "2025-02-15", part: "Cusco Strut Tower Bar" },
];

export default function SellerProfilePage({ params }: { params: { sellerId: string } }) {
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? "#ffb300" : "var(--border)", fontSize: "14px" }}>★</span>
    ));

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Avatar */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent2), #ff8c00)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="display-font" style={{ fontSize: "36px", color: "#fff" }}>
              {SELLER.shopName.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 700 }}>{SELLER.shopName}</h1>
              {SELLER.verified && (
                <span style={{ background: "rgba(0,230,118,0.12)", color: "var(--green)", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", letterSpacing: "1px" }}>
                  ✓ VERIFIED
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
              {renderStars(SELLER.rating)}
              <span style={{ marginLeft: "6px", fontWeight: 600, fontSize: "14px" }}>{SELLER.rating}</span>
              <span style={{ color: "var(--muted)", fontSize: "13px" }}>({SELLER.reviewCount} reviews)</span>
            </div>

            <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px", maxWidth: "600px" }}>
              {SELLER.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {SELLER.specialties.map(s => (
                <span key={s} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "3px 10px", fontSize: "12px" }}>
                  {s}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {SELLER.city && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)" }}>
                  <MapPin size={14} /> {SELLER.city}, {SELLER.province}
                </div>
              )}
              {SELLER.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)" }}>
                  <Phone size={14} /> {SELLER.phone}
                </div>
              )}
              {SELLER.lineId && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--green)" }}>
                  <MessageCircle size={14} /> {SELLER.lineId}
                </div>
              )}
              {SELLER.facebook && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#4267B2" }}>
                  <Globe size={14} /> {SELLER.facebook}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            {[
              { label: "Total Sales", value: SELLER.totalSales, color: "var(--accent)" },
              { label: "Active Listings", value: SELLER_LISTINGS.length, color: "var(--text)" },
              { label: "Member Since", value: new Date(SELLER.joinedDate).getFullYear(), color: "var(--muted)" },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: "14px 20px", textAlign: "center", minWidth: "120px" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        {([
          { key: "listings", label: `Listings (${SELLER_LISTINGS.length})` },
          { key: "reviews", label: `Reviews (${SELLER.reviewCount})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            background: "none", border: "none",
            color: activeTab === t.key ? "var(--accent)" : "var(--muted)",
            cursor: "pointer", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            borderBottom: activeTab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "listings" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {SELLER_LISTINGS.map(p => <PartCard key={p.id} part={p} />)}
        </div>
      )}

      {activeTab === "reviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {REVIEWS.map(r => (
            <div key={r.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{r.buyer}</span>
                    <div style={{ display: "flex" }}>{renderStars(r.rating)}</div>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>re: {r.part}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>{r.date}</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}