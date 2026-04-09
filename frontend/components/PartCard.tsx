import { useAuth } from "@/context/AuthContext";
import StatusBadge from "./StatusBadge";

export interface Part {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  fitment?: string[];
  status: "pending" | "approved" | "rejected" | "shipped" | "confirmed" | "held";
  category?: string;
  seller?: string;
  seller_id?: number | string;
  description?: string;
}

export default function PartCard({ part, hideStatus }: { readonly part: Part; readonly hideStatus?: boolean }) {
  const { user } = useAuth();

  return (
    <div className="card" style={{
      padding: "20px",
      transition: "border-color 0.2s, transform 0.2s",
      cursor: "pointer",
    }}
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
        {part.brand ? `by ${part.brand}` : "Unknown Brand"} {part.seller ? `· ${part.seller}` : `· Seller #${part.seller_id}`}
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
        <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent)" }}>
          ฿{part.price.toLocaleString()}
        </span>
        {(!user || user.role === "buyer") && (
          <button className="btn-accent" style={{ padding: "8px 18px", fontSize: "13px" }}>
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}