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
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

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
        {filtered.map(p => <PartCard key={p.id} part={p} hideStatus onClick={() => setSelectedPart(p)} />)}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p>No parts found for your search. Try adjusting the filters.</p>
        </div>
      )}

      {/* Modal for Part Details */}
      {selectedPart && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
        }} onClick={() => { setSelectedPart(null); setCurrentImageIndex(0); }}>
          <div className="card" style={{
            background: "#000000", padding: "32px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", border: "1px solid var(--border)"
          }} onClick={e => e.stopPropagation()}>
            <button className="btn-ghost" style={{ position: "absolute", top: "16px", right: "16px" }} onClick={() => { setSelectedPart(null); setCurrentImageIndex(0); }}>✕ Close</button>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginTop: "16px" }}>
              {selectedPart.image_url ? (
                <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
                  {(() => {
                    const images = selectedPart.image_url.split(",");
                    const mainImg = currentImageIndex !== undefined && currentImageIndex < images.length ? images[currentImageIndex] : images[0];
                    const nextImg = () => {
                      if (currentImageIndex !== undefined) {
                        setCurrentImageIndex((currentImageIndex + 1) % images.length);
                      } else {
                        setCurrentImageIndex(1 % images.length);
                      }
                    };
                    const prevImg = () => {
                      if (currentImageIndex !== undefined) {
                        setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
                      } else {
                        setCurrentImageIndex((images.length - 1) % images.length);
                      }
                    };

                    return images.length > 1 ? (
                      <div style={{ display: "grid", gap: "8px" }}>
                        <div style={{ position: "relative" }}>
                          <button onClick={prevImg} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", zIndex: 10 }}>&lt;</button>
                          <img src={mainImg.startsWith("/") ? `http://localhost:8000${mainImg}` : mainImg} alt={selectedPart.name} style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover" }} />
                          <button onClick={nextImg} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", zIndex: 10 }}>&gt;</button>
                        </div>
                        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                          {images.map((img, idx) => (
                             <img key={idx} src={img.startsWith("/") ? `http://localhost:8000${img}` : img} alt={`${selectedPart.name}-${idx}`} 
                               onClick={() => setCurrentImageIndex(idx)}
                               style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover", flexShrink: 0, cursor: "pointer", border: (currentImageIndex || 0) === idx ? "2px solid var(--primary)" : "none" }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <img src={mainImg.startsWith("/") ? `http://localhost:8000${mainImg}` : mainImg} alt={selectedPart.name} style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover" }} />
                    );
                  })()}
                </div>
              ) : (
                <div style={{ flex: "1 1 300px", minWidth: "300px", background: "var(--surface)", height: "300px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                  No Image Provided
                </div>
              )}
              <div style={{ flex: "2 1 300px", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>{selectedPart.category || "Uncategorized"}</span>
                <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0" }}>{selectedPart.name}</h2>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>฿{selectedPart.price.toLocaleString()}</div>
                <p style={{ color: "var(--text)", marginBottom: "16px", lineHeight: 1.6 }}>{selectedPart.description || "No description provided."}</p>
                <div style={{ marginTop: "auto" }}>
                  <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>Brand: <span style={{ color: "var(--text)", fontWeight: 500 }}>{selectedPart.brand || "Unknown"}</span></p>
                  <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>Seller: <span style={{ color: "var(--accent)", fontWeight: 500 }}>{selectedPart.seller_name || `Seller #${selectedPart.seller_id}`}</span></p>
                  <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>Stock: <span style={{ color: "var(--text)", fontWeight: 500 }}>{selectedPart.quantity}</span></p>
                  <button className="btn-accent" style={{ width: "100%", padding: "12px" }} onClick={() => window.location.href = `/checkout/${selectedPart.id}`}>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}