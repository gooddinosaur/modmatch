import PartCard, { Part } from "@/components/PartCard";

const ALL_PARTS: Part[] = [
  { id: "1", name: "Cold Air Intake Kit", brand: "K&N", price: 8500, fitment: ["Honda Civic 2018–2020"], status: "approved", category: "Intake", seller: "TurboGarage_BKK" },
  { id: "2", name: "Bilstein B6 Shock Set", brand: "Bilstein", price: 24000, fitment: ["Toyota GR86 2022", "Subaru BRZ 2022"], status: "approved", category: "Suspension", seller: "JDMPartsPro" },
  { id: "3", name: "Brembo Sport Brake Kit", brand: "Brembo", price: 45000, fitment: ["BMW 3 Series 2020–2021"], status: "approved", category: "Brakes", seller: "EuroMods_TH" },
  { id: "4", name: "Tomei Expreme Ti Exhaust", brand: "Tomei", price: 32000, fitment: ["Nissan Silvia S15"], status: "pending", category: "Exhaust", seller: "JDMPartsPro" },
  { id: "5", name: "Cusco Strut Tower Bar", brand: "Cusco", price: 6200, fitment: ["Mazda MX-5 2019–2021"], status: "approved", category: "Chassis", seller: "JDMPartsPro" },
  { id: "6", name: "HKS Intercooler Kit", brand: "HKS", price: 18500, fitment: ["Subaru WRX 2018–2022"], status: "approved", category: "Intake", seller: "TurboGarage_BKK" },
];

export default function ListingsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="display-font" style={{ fontSize: "56px", letterSpacing: "2px", marginBottom: "8px" }}>
        ALL <span style={{ color: "var(--accent)" }}>LISTINGS</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px" }}>
        Admin-verified parts only. Unverified listings are not shown to buyers.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {ALL_PARTS.filter(p => p.status === "approved").map(p => (
          <PartCard key={p.id} part={p} />
        ))}
      </div>
    </div>
  );
}