"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, CheckCircle2 } from "lucide-react";
import PartCard, { Part } from "@/components/PartCard";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = ["All Categories", "Intake", "Exhaust", "Suspension", "Brakes", "Engine", "Chassis", "Aero", "Other"];

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchParts();
  }, [user?.token]);

  const fetchParts = async () => {
    try {
      const params = new URLSearchParams();
      // Search logic mostly handled via frontend filter

      
      let token = user?.token;
      if (!token) {
        const stored = localStorage.getItem("modmatch_user");
        if (stored) {
          try { token = JSON.parse(stored).token; } catch (e) {}
        }
      }

      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API}/buyer/search?${params.toString()}`, {
        headers
      });
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

  // Filtering happens on the frontend since the API returns all approved parts
  const filtered = parts.filter(p => {
    // Category match
    if (category !== "All Categories" && p.category && p.category !== category) return false;
    
    // Text search match (part name, description, brand, fitment)
    if (searchText && searchText.trim() !== "") {
      const q = searchText.toLowerCase();
      const textMatches = 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.fit_vehicles && Array.isArray(p.fit_vehicles) && p.fit_vehicles.join(" ").toLowerCase().includes(q)) ||
        (p.fitment && Array.isArray(p.fitment) && p.fitment.join(" ").toLowerCase().includes(q));
        
      if (!textMatches) return false;
    }
    
    return true;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="display-font" style={{ fontSize: "56px", letterSpacing: "2px", marginBottom: "8px" }}>
        FIND YOUR <span style={{ color: "var(--accent)" }}>PARTS</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px" }}>
        Browse verified listings and check fitment compatibility against your garage.
      </p>

      {/* Filters */}
      <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 300px" }}>
            <label htmlFor="search-input" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Search by name, brand, etc.</label>
            <input id="search-input" placeholder="e.g. K&N Intake, Civic, GR86" value={searchText} onChange={e => setSearchText(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="category-select" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Category</label>
            <select id="category-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-accent" style={{ padding: "12px 32px", height: "48px" }} onClick={fetchParts}>Refresh</button>
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
        <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Search size={48} color="var(--muted)" style={{ marginBottom: "16px" }} />
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", color: "var(--muted)", fontSize: "14px" }}>        
                   <span style={{ color: (selectedPart.rating ?? 0) > 0 ? "#fbbf24" : "var(--muted)", display: "flex", alignItems: "center" }}>
                     <Star size={16} fill="currentColor" strokeWidth={(selectedPart.rating ?? 0) > 0 ? 0 : 1} />
                   </span>
                   <span style={{ fontWeight: 600, color: (selectedPart.rating ?? 0) > 0 ? "var(--text)" : "var(--muted)" }}>
                     {(selectedPart.rating ?? 0).toFixed(1)}
                   </span>
                   <span>({selectedPart.reviews_count || 0} {(selectedPart.reviews_count === 1) ? "Review" : "Reviews"})</span>    
                </div>
                {selectedPart.fit_vehicles && selectedPart.fit_vehicles.length > 0 && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "6px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, marginBottom: "16px", alignSelf: "flex-start" }}>
                    <CheckCircle2 size={16} />
                    Guaranteed to fit your {selectedPart.fit_vehicles.join(", ")}
                  </div>
                )}
                {(() => {
                  let descText = selectedPart.description || "No description provided.";
                  let fitmentText = "";
                  if (descText.includes("Compatible Vehicles:")) {
                    const parts = descText.split("Compatible Vehicles:");
                    descText = parts[0].trim();
                    fitmentText = parts[1].trim();
                  }
                  return (
                    <>
                      <p style={{ color: "var(--text)", marginBottom: "16px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{descText}</p>
                      <div style={{ marginTop: "auto" }}>
                        {fitmentText && (
                          <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>Compatible Vehicles: <span style={{ color: "var(--text)", fontWeight: 500 }}>{fitmentText}</span></p>
                        )}
                        <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>Brand: <span style={{ color: "var(--text)", fontWeight: 500 }}>{selectedPart.brand || "Unknown"}</span></p>
                        <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>
                          Seller: <span 
                            style={{ color: "var(--accent)", fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => router.push(`/seller/${selectedPart.seller_id}`)}
                          >
                            {selectedPart.seller_name || `Seller #${selectedPart.seller_id}`}
                          </span>
                        </p>
                        <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>Stock: <span style={{ color: "var(--text)", fontWeight: 500 }}>{selectedPart.quantity}</span></p>
                        <button className="btn-accent" style={{ width: "100%", padding: "12px" }} onClick={() => router.push(`/checkout/${selectedPart.id}`)}>
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            {/* Reviews Section */}
            {selectedPart.reviews_list && selectedPart.reviews_list.length > 0 && (
              <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Customer Reviews</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {selectedPart.reviews_list.map((review, idx) => (
                    <div key={idx} style={{ background: "var(--surface)", padding: "16px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600 }}>{review.buyer_name}</span>
                          <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                             • {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: "flex", color: "#fbbf24", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1} color={i < review.rating ? "#fbbf24" : "var(--muted)"} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--text)" }}>{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}          </div>
        </div>
      )}
    </div>
  );
}