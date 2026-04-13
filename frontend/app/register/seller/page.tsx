"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Wrench, ArrowRight, ArrowLeft, Store, CheckCircle, Eye, EyeOff } from "lucide-react";

type Step = "account" | "shop";

interface ShopData {
  shopName: string; description: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string;
  lineId: string; facebook: string;
}

export default function SellerRegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [shop, setShop] = useState<ShopData>({
    shopName: "", description: "", phone: "",
    addressLine1: "", addressLine2: "",
    city: "", province: "", postalCode: "",
    lineId: "", facebook: "",
  });

  const handleAccountSubmit = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setStep("shop");
  };

  const handleFinalSubmit = async () => {
    setError("");
    if (!shop.shopName) { setError("Shop name is required."); return; }
    setLoading(true);
    try {
      await register(email, password, "seller", shop.shopName, shop.description, shop.phone);
      // TODO: save shop data to API
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
      {(["account", "shop"] as Step[]).map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: (step === "shop" && i === 0) ? "var(--green)" : s === step ? "var(--accent2)" : "var(--surface2)",
            border: `2px solid ${(step === "shop" && i === 0) ? "var(--green)" : s === step ? "var(--accent2)" : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700,
            color: s === step || (step === "shop" && i === 0) ? "#fff" : "var(--muted)",
            transition: "all 0.3s", flexShrink: 0,
          }}>
            {step === "shop" && i === 0 ? <CheckCircle size={16} /> : i + 1}
          </div>
          {i === 0 && (
            <div style={{ width: "60px", height: "2px", background: step === "shop" ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />
          )}
        </div>
      ))}
      <div style={{ marginLeft: "16px", fontSize: "13px", color: "var(--muted)" }}>
        {step === "account" ? "Create Account" : "Shop Details"}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Join as Seller
          </p>
          <h1 className="display-font" style={{ fontSize: "48px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "12px" }}>
            START<br /><span style={{ color: "var(--accent2)" }}>SELLING</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <StepIndicator />

        {/* Step 1: Account */}
        {step === "account" && (
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <Wrench size={20} color="var(--accent2)" />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Account Details</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Email Address</label>
                <input type="email" placeholder="shop@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: "40px" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center" }} title={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAccountSubmit()} style={{ paddingRight: "40px" }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center" }} title={showConfirmPassword ? "Hide password" : "Show password"}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <div style={{ background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)", borderRadius: "6px", padding: "10px 14px", color: "var(--red)", fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <button style={{
                background: "var(--accent2)", color: "#fff", fontWeight: 700, padding: "14px",
                borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }} onClick={handleAccountSubmit}>
                Continue <ArrowRight size={16} />
              </button>
              <p style={{ fontSize: "11px", color: "var(--muted)", textAlign: "center" }}>
                ⚠️ Seller accounts are subject to admin approval for listings.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Shop Details */}
        {step === "shop" && (
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Store size={20} color="var(--accent2)" />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Shop Details</h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "24px" }}>
              This info will be shown on your public seller profile.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                  Shop Name <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input placeholder="e.g. TurboGarage BKK" value={shop.shopName} onChange={e => setShop({ ...shop, shopName: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Shop Description</label>
                <textarea
                  placeholder="Tell buyers about your shop, specialties, brands you carry..."
                  value={shop.description}
                  onChange={e => setShop({ ...shop, description: e.target.value })}
                  style={{
                    background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)",
                    padding: "10px 14px", borderRadius: "6px", fontFamily: "DM Sans, sans-serif",
                    fontSize: "14px", width: "100%", minHeight: "80px", resize: "vertical", outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Phone / Contact</label>
                <input placeholder="08X-XXX-XXXX" value={shop.phone} onChange={e => setShop({ ...shop, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Shop Address</label>
                <input placeholder="Building / Street" value={shop.addressLine1}
                  onChange={e => setShop({ ...shop, addressLine1: e.target.value })} style={{ marginBottom: "8px" }} />
                <input placeholder="Subdistrict / District" value={shop.addressLine2}
                  onChange={e => setShop({ ...shop, addressLine2: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>City</label>
                  <input placeholder="Bangkok" value={shop.city} onChange={e => setShop({ ...shop, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Province</label>
                  <input placeholder="BKK" value={shop.province} onChange={e => setShop({ ...shop, province: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Postal</label>
                  <input placeholder="10110" value={shop.postalCode} onChange={e => setShop({ ...shop, postalCode: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>LINE ID</label>
                  <input placeholder="@yourshop" value={shop.lineId} onChange={e => setShop({ ...shop, lineId: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Facebook</label>
                  <input placeholder="facebook.com/yourshop" value={shop.facebook} onChange={e => setShop({ ...shop, facebook: e.target.value })} />
                </div>
              </div>
              {error && (
                <div style={{ background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)", borderRadius: "6px", padding: "10px 14px", color: "var(--red)", fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                <button className="btn-ghost" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setStep("account")}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button disabled={loading} onClick={handleFinalSubmit} style={{
                  flex: 1, background: "var(--accent2)", color: "#fff", fontWeight: 700, padding: "12px",
                  borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                  fontSize: "14px", opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}>
                  {loading ? "Creating..." : <><CheckCircle size={15} /> Create Shop</>}
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
          Looking to buy parts?{" "}
          <Link href="/register/buyer" style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>Register as Buyer →</Link>
        </p>
      </div>
    </div>
  );
}