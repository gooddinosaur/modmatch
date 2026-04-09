"use client";
import { useState, useEffect } from "react";
import PartCard, { Part } from "@/components/PartCard";
import { useAuth } from "@/context/AuthContext";

const MAKES = ["All Makes", "Honda", "Toyota", "BMW", "Mazda", "Subaru", "Nissan"];
const CATEGORIES = ["All Categories", "Intake", "Exhaust", "Suspension", "Brakes", "Engine", "Chassis", "Aero"];

export default function SearchPage() {
  const { user } = useAuth();
  const [make, setMake] = useState("All Makes");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (make !== "All Makes") params.append("make", make);
      if (model) params.append("model", model);
      if (year) params.append("year", year);
      
      const res = await fetch(`${API}/buyer/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setParts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Keep category filtering in frontend, as the generic /search endpoint returns all parts or based on make/model
  const filtered = parts.filter(p => {
    // If category is not "All Categories", filter match
    if (category !== "All Categories" && p.category && p.category !== category) return false;
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
            <label htmlFor="make-select" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Make</label>
            <select id="make-select" value={make} onChange={e => { setMake(e.target.value); fetchParts(); }}>
              {MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="model-input" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Model</label>
            <input id="model-input" placeholder="e.g. Civic, GR86" value={model} onChange={e => setModel(e.target.value)} onBlur={fetchParts} />
          </div>
          <div>
            <label htmlFor="year-input" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Year</label>
            <input id="year-input" placeholder="e.g. 2021" value={year} onChange={e => setYear(e.target.value)} onBlur={fetchParts} />
          </div>
          <div>
            <label htmlFor="category-select" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Category</label>
            <select id="category-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
             <button className="btn-accent" style={{ width: "100%" }} onClick={fetchParts}>Search</button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ color: "var(--muted)", fontSize: "14px" }}>
          {loading ? "Searching..." : `${filtered.length} parts found`}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filtered.map(p => <PartCard key={p.id} part={p} hideStatus />)}
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