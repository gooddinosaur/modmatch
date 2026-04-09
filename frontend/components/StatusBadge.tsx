type Status = "pending" | "approved" | "rejected" | "shipped" | "confirmed" | "held" | "payment_held" | "funds_released" | "refunded" | "reported";

export default function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; color: string; bg: string }> = {
    pending:        { label: "Pending",        color: "#ffb300", bg: "rgba(255,179,0,0.12)" },
    approved:       { label: "Approved",       color: "#00e676", bg: "rgba(0,230,118,0.12)" },
    rejected:       { label: "Rejected",       color: "#ff3d3d", bg: "rgba(255,61,61,0.12)" },
    shipped:        { label: "Shipped",        color: "#40c4ff", bg: "rgba(64,196,255,0.12)" },
    confirmed:      { label: "Confirmed",      color: "#00e676", bg: "rgba(0,230,118,0.12)" },
    held:           { label: "Funds Held",     color: "#ffb300", bg: "rgba(255,179,0,0.12)" },
    payment_held:   { label: "Funds Held",     color: "#ffb300", bg: "rgba(255,179,0,0.12)" },
    funds_released: { label: "Funds Released", color: "#00e676", bg: "rgba(0,230,118,0.12)" },
    refunded:       { label: "Refunded",       color: "#ff3d3d", bg: "rgba(255,61,61,0.12)" },
    reported:       { label: "Reported",       color: "#ff3d3d", bg: "rgba(255,61,61,0.12)" },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      letterSpacing: "0.3px",
    }}>
      {s.label}
    </span>
  );
}
