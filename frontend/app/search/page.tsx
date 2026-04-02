"use client";
import { useState } from "react";
import PartCard, { Part } from "@/components/PartCard";

const MOCK_PARTS: Part[] = [
  { id: "1", name: "Cold Air Intake Kit", brand: "K&N", price: 8500, fitment: ["Honda Civic 2018", "Honda Civic 2019", "Honda Civic 2020"], status: "approved", category: "Intake", seller: "TurboGarage_BKK" },
  { id: "2", name: "Bilstein B6 Shock Absorber Set", brand: "Bilstein", price: 24000, fitment: ["Toyota GR86 2022", "Subaru BRZ 2022"], status: "approved", category: "Suspension", seller: "JDMPartsPro" },
  { id: "3", name: "Brembo Sport Brake Kit", brand: "Brembo", price: 45000, fitment: ["BMW 3 Series 2020", "BMW 3 Series 2021"], status: "approved", category: "Brakes", seller: "EuroMods_TH" },
  { id: "4", name: "Cusco Strut Tower Bar", brand: "Cusco", price: 6200, fitment: ["Mazda MX-5 2019", "Mazda MX-5 2020", "Mazda MX-5 2021"], status: "approved", category: "Chassis", seller: "JDMPartsPro" },
];

const MAKES = ["All Makes", "Honda", "Toyota", "BMW", "Mazda", "Subaru", "Nissan"];
const CATEGORIES = ["All Categories", "Intake", "Exhaust", "Suspension", "Brakes", "Engine", "Chassis", "Aero"];

export default function SearchPage() {
  const [make, setMake] = useState("All Makes");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filtered = MOCK_PARTS.filter(p => {
    if (category !== "All Categories" && p.category !== category) return false;
    if (model && !p.fitment.some(f => f.toLowerCase().includes(model.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="display-font" style={{ fontSize: "56px", letterSpacing: "2px", marginBottom: "8px" }}>
        FIND YOUR <span style={{ color: "var(--accent)" }}>PARTS</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px" }}>
        Every result is guaranteed to fit your specific vehicle.
      </p>

      {/* Filters */}
      <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Make</label>
            <select value={make} onChange={e => setMake(e.target.value)}>
              {MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Model</label>
            <input placeholder="e.g. Civic, GR86" value={model} onChange={e => setModel(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Year</label>
            <input placeholder="e.g. 2021" value={year} onChange={e => setYear(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ color: "var(--muted)", fontSize: "14px" }}>{filtered.length} parts found</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filtered.map(p => <PartCard key={p.id} part={p} />)}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p>No parts found for your search. Try adjusting the filters.</p>
        </div>
      )}
    </div>
  );
}