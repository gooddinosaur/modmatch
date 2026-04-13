"use client";

import { useAuth } from "@/context/AuthContext";
import StatusBadge from "./StatusBadge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle2 } from "lucide-react";

export interface Part {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  quantity?: number;
  fitment?: string[];
  fit_vehicles?: string[];
  rating?: number | null;
  reviews_count?: number;
  reviews_list?: { rating: number, comment: string | null, created_at: string, buyer_name: string }[];
  status: "pending" | "approved" | "rejected" | "shipped" | "confirmed" | "held";
  category?: string;
  seller_name?: string;
  seller_id?: number | string;
  description?: string;
  image_url?: string;
  seller?: string;
}

export default function PartCard({ part, hideStatus, onClick }: { readonly part: Part; readonly hideStatus?: boolean; readonly onClick?: () => void; }) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="card" style={{
      padding: "20px",
      transition: "border-color 0.2s, transform 0.2s",
      cursor: onClick ? "pointer" : "default",
    }}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Category tag */}
      {part.image_url && (
        <div style={{ margin: "-20px -20px 20px -20px", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--surface)", height: "200px", overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
          <img 
            src={part.image_url.split(",")[0].startsWith("http") ? part.image_url.split(",")[0] : `http://localhost:8000${part.image_url.split(",")[0].startsWith("/") ? "" : "/"}${part.image_url.split(",")[0]}`} 
            alt={part.name} 
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} 
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }} 
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}>
          {part.category || "Uncategorized"}
        </span>
        {!hideStatus && <StatusBadge status={part.status} />}
      </div>

      {/* Part name */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{part.name}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: (part.rating ?? 0) > 0 ? "#fbbf24" : "var(--muted)" }}>
          <Star size={14} fill="currentColor" strokeWidth={(part.rating ?? 0) > 0 ? 0 : 1} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: (part.rating ?? 0) > 0 ? "inherit" : "var(--muted)" }}>
            {(part.rating ?? 0).toFixed(1)}
          </span>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            ({part.reviews_count || 0} {(part.reviews_count === 1) ? "Review" : "Reviews"})
          </span>
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px" }}>
        {part.brand ? `by ${part.brand}` : "Unknown Brand"} -{" "}
        <Link href={`/seller/${part.seller_id}`} passHref>
          <span style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
            {part.seller_name || `Seller #${part.seller_id}`}
          </span>
        </Link>
      </p>

      {/* Fitment matches */}
      {part.fit_vehicles && part.fit_vehicles.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px",
          background: "rgba(0, 255, 136, 0.1)", border: "1px solid rgba(0, 255, 136, 0.3)",
          color: "var(--green)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600
        }}>
          <CheckCircle2 size={14} />
          <span>Fits your {part.fit_vehicles.join(", ")}</span>
        </div>
      )}

      {/* Legacy Fitment */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {part.fitment?.map(f => (
          <span key={f} style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "12px",
            color: "var(--text)",
          }}>
            {f}
          </span>
        ))}
      </div>

      {/* Price + CTA logic */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent)" }}>
            ฿{part.price.toLocaleString()}
          </span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
            {part.quantity !== undefined ? `${part.quantity} in stock` : ""}
          </span>
        </div>
        {(!user || user.role === "buyer") && (
          <button className="btn-accent" style={{ padding: "8px 18px", fontSize: "13px" }} onClick={(e) => { e.stopPropagation(); router.push(`/checkout/${part.id}`); }}>
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}