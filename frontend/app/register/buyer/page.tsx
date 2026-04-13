"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, ArrowLeft, MapPin, Car, CheckCircle, Eye, EyeOff } from "lucide-react";

type Step = "account" | "shipping" | "vehicle";

interface ShippingData {
  firstName: string; lastName: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string;
}

interface VehicleData {
  make: string; model: string; year: string; subModel: string;
}

const MAKES = ["Honda", "Toyota", "Mazda", "Subaru", "Nissan", "Mitsubishi", "BMW", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Other"];

export default function BuyerRegisterPage() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState<ShippingData>({
    firstName: "", lastName: "", phone: "",
    addressLine1: "", addressLine2: "",
    city: "", province: "", postalCode: "",
  });

  const [vehicle, setVehicle] = useState<VehicleData>({
    make: "", model: "", year: "", subModel: "",
  });

  const steps: Step[] = ["account", "shipping", "vehicle"];
  const stepIndex = steps.indexOf(step);

  const handleAccountSubmit = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setStep("shipping");
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Register the user to get the token
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "buyer" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }
      const data = await res.json();
      const token = data.access_token;
      
      // 2. Add shipping address
      if (shipping.addressLine1 && shipping.city) {
        await fetch("http://localhost:8000/api/v1/buyer/addresses", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home",
            first_name: shipping.firstName || "Unknown",
            last_name: shipping.lastName || "Unknown",
            phone: shipping.phone || "-",
            address_line1: shipping.addressLine1,
            address_line2: shipping.addressLine2 || "",
            city: shipping.city,
            province: shipping.province,
            postal_code: shipping.postalCode
          })
        });
      }

      // 3. Add vehicle
      if (vehicle.make && vehicle.model && vehicle.year) {
        await fetch("http://localhost:8000/api/v1/buyer/vehicles", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            sub_model: vehicle.subModel || ""
          })
        });
      }

      // 4. Finally log them in via context properly (which redirects)
      // Since context `register` also tries to hit `/auth/register` and will get an "Email already registered" error,
      // we need to call `login` instead because we just manually created the user above!
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
      setStep("account");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: i < stepIndex ? "var(--green)" : i === stepIndex ? "var(--accent)" : "var(--surface2)",
            border: `2px solid ${i < stepIndex ? "var(--green)" : i === stepIndex ? "var(--accent)" : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700,
            color: i <= stepIndex ? "#000" : "var(--muted)",
            transition: "all 0.3s", flexShrink: 0,
          }}>
            {i < stepIndex ? <CheckCircle size={16} /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: "60px", height: "2px", background: i < stepIndex ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />
          )}
        </div>
      ))}
      <div style={{ marginLeft: "16px", fontSize: "13px", color: "var(--muted)" }}>
        {step === "account" && "Create Account"}
        {step === "shipping" && "Shipping Info"}
        {step === "vehicle" && "Your Vehicle"}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Join as Buyer
          </p>
          <h1 className="display-font" style={{ fontSize: "48px", lineHeight: 0.9, letterSpacing: "2px", marginBottom: "12px" }}>
            FIND YOUR<br /><span style={{ color: "var(--accent)" }}>PARTS</span>
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
              <ShieldCheck size={20} color="var(--green)" />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Account Details</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
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
              <button className="btn-accent" style={{ width: "100%", padding: "14px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onClick={handleAccountSubmit}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === "shipping" && (
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <MapPin size={20} color="var(--accent)" />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Shipping Address</h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "24px" }}>
              Optional — you can skip and add this later before purchasing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>First Name</label>
                  <input placeholder="Somchai" value={shipping.firstName} onChange={e => setShipping({ ...shipping, firstName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Last Name</label>
                  <input placeholder="Rakpong" value={shipping.lastName} onChange={e => setShipping({ ...shipping, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Phone Number</label>
                <input placeholder="08X-XXX-XXXX" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Address Line 1</label>
                <input placeholder="House no. / Building / Street" value={shipping.addressLine1} onChange={e => setShipping({ ...shipping, addressLine1: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                  Address Line 2 <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input placeholder="Subdistrict / District" value={shipping.addressLine2} onChange={e => setShipping({ ...shipping, addressLine2: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>City</label>
                  <input placeholder="Bangkok" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Province</label>
                  <input placeholder="BKK" value={shipping.province} onChange={e => setShipping({ ...shipping, province: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Postal</label>
                  <input placeholder="10110" value={shipping.postalCode} onChange={e => setShipping({ ...shipping, postalCode: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                <button className="btn-ghost" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setStep("account")}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button className="btn-ghost" style={{ flex: 1, padding: "12px", color: "var(--muted)" }}
                  onClick={() => setStep("vehicle")}>
                  Skip for now
                </button>
                <button className="btn-accent" style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setStep("vehicle")}>
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Vehicle */}
        {step === "vehicle" && (
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Car size={20} color="var(--accent)" />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Your Vehicle</h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "24px" }}>
              Optional — add your car now for smarter part recommendations, or skip and add later.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Make</label>
                <select value={vehicle.make} onChange={e => setVehicle({ ...vehicle, make: e.target.value })}>
                  <option value="">Select Make</option>
                  {MAKES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Model</label>
                  <input placeholder="e.g. Civic, GR86" value={vehicle.model} onChange={e => setVehicle({ ...vehicle, model: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Year</label>
                  <input type="number" placeholder="2020" value={vehicle.year} onChange={e => setVehicle({ ...vehicle, year: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                  Sub-Model / Trim <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input placeholder="e.g. Type R, Sport, GT" value={vehicle.subModel} onChange={e => setVehicle({ ...vehicle, subModel: e.target.value })} />
              </div>
              {error && (
                <div style={{ background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)", borderRadius: "6px", padding: "10px 14px", color: "var(--red)", fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                <button className="btn-ghost" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setStep("shipping")}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button className="btn-ghost" style={{ flex: 1, padding: "12px", color: "var(--muted)" }}
                  onClick={handleFinalSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Skip & Finish"}
                </button>
                <button className="btn-accent" style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={handleFinalSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Finish"} {!loading && <CheckCircle size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
          Selling parts instead?{" "}
          <Link href="/register/seller" style={{ color: "var(--accent2)", textDecoration: "none", fontWeight: 600 }}>Register as Seller →</Link>
        </p>
      </div>
    </div>
  );
}