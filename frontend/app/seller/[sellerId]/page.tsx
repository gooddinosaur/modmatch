"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, Package, MapPin } from "lucide-react";
import PartCard, { Part } from "@/components/PartCard";
import { useAuth } from "@/context/AuthContext";

interface SellerProfile {
  id: number;
  display_name: string;
  email: string;
  phone: string | null;
  description: string | null;
  line_id: string | null;
  facebook: string | null;
  specialties: string | null;
  address?: {
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
  } | null;
}

export default function SellerProfilePage() {
  const { sellerId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (!sellerId) return;
    
    const fetchSeller = async () => {
      try {
        const res = await fetch(`${API}/buyer/sellers/${sellerId}`);
        if (res.ok) {
          const data = await res.json();
          setSeller(data.seller);
          setParts(data.parts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeller();
  }, [sellerId, API]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
        <p style={{ color: "var(--muted)" }}>Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
        <h1 className="display-font" style={{ fontSize: "32px", marginBottom: "16px" }}>Seller Not Found</h1>
        <p style={{ color: "var(--muted)" }}>We couldn&apos;t find a seller with this ID.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      {/* Seller Header */}
      <div className="card" style={{ padding: "40px", marginBottom: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", width: "100%", justifyContent: "flex-end", marginBottom: "-24px" }}>
          {sellerId === String(user?.id) && (
            <button className="btn-ghost" onClick={() => router.push("/profile/seller")} style={{ fontSize: "14px", padding: "8px 16px" }}>
              Edit Profile
            </button>
          )}
        </div>
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "var(--accent)",
          color: "var(--bg)",
          fontSize: "40px",
          fontWeight: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          {seller.display_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="display-font" style={{ fontSize: "40px", marginBottom: "8px" }}>
          {seller.display_name}
        </h1>
        {seller.specialties && (
          <div style={{ color: "var(--accent)", fontWeight: 600, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Specialties: {seller.specialties}
          </div>
        )}
        <p style={{ color: "var(--muted)", maxWidth: "800px", margin: "0 auto", marginBottom: "32px", fontSize: "16px", lineHeight: "1.6" }}>
          {seller.description ? seller.description : `Welcome to ${seller.display_name}'s shop. Browse their available parts, backed by our fitment guarantee.`}
        </p>
        
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          {seller.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}><Mail size={16} /></span>
              <span>{seller.email}</span>
            </div>
          )}
          {seller.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}><Phone size={16} /></span>
              <span>{seller.phone}</span>
            </div>
          )}
          {seller.line_id && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "#00C300", fontWeight: 'bold' }}>LINE</span>
              <span>{seller.line_id}</span>
            </div>
          )}
          {seller.facebook && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "#1877F2", fontWeight: 'bold' }}>FB</span>
              <a href={seller.facebook.startsWith('http') ? seller.facebook : `https://facebook.com/${seller.facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                {seller.facebook.replace(/https?:\/\/(www\.)?facebook\.com\//, '')}
              </a>
            </div>
          )}
          {seller.address && (seller.address.city || seller.address.province || seller.address.address_line1) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}><MapPin size={16} /></span>
              <span>
                {[seller.address.address_line1, seller.address.address_line2, seller.address.city, seller.address.province, seller.address.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Seller's Parts List */}
      <h2 className="display-font" style={{ fontSize: "32px", marginBottom: "8px" }}>
        SELLER&apos;S <span style={{ color: "var(--accent)" }}>LISTINGS</span>
      </h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <span style={{ color: "var(--muted)", fontSize: "14px" }}>
          {parts.length} {parts.length === 1 ? "part" : "parts"} available
        </span>
      </div>

      {parts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {parts.map(p => <PartCard key={p.id} part={p} hideStatus />)}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Package size={48} color="var(--muted)" style={{ marginBottom: "16px" }} />
          <p>This seller currently has no available listings.</p>
        </div>
      )}
    </div>
  );
}
