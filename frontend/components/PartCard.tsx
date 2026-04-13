"use client";

import { useAuth } from "@/context/AuthContext";
import StatusBadge from "./StatusBadge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface Part {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  quantity?: number;
  fitment?: string[];
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
      <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px" }}>
        {part.brand ? `by ${part.brand}` : "Unknown Brand"} -{" "}
        <Link href={`/seller/${part.seller_id}`} passHref>
          <span style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
            {part.seller_name || `Seller #${part.seller_id}`}
          </span>
        </Link>
      </p>

      {/* Fitment */}
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