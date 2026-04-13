"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Part } from "@/components/PartCard";
import { CreditCard, Truck, AlertCircle, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const partId = params.partId as string;
  const { user, loading: authLoading } = useAuth();
  
  const [part, setPart] = useState<Part | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/checkout/" + partId);
      return;
    }
    fetchData();
  }, [user, partId, authLoading]);

  const fetchData = async () => {
    if (!user?.token) return;
    try {
      // Fetch part details
      const partRes = await fetch(`${API}/buyer/parts/${partId}`);
      if (partRes.ok) {
        setPart(await partRes.json());
      } else {
        setError("Part not found or not available.");
      }

      // Fetch addresses
      const addrRes = await fetch(`${API}/buyer/addresses`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
        if (addrData.length > 0) {
          const defaultAddr = addrData.find((a: any) => a.is_default) || addrData[0];
          setSelectedAddress(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load checkout data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please add or select a shipping address.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!part) return;

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`${API}/buyer/buy`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ part_id: part.id, amount: part.price })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile/buyer");
        }, 3000);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to process payment.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during checkout.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: "48px", textAlign: "center" }}>Loading Checkout...</div>;

  if (success) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "48px 32px" }} className="card">
        <CheckCircle size={64} color="var(--green)" style={{ margin: "0 auto 20px" }} />
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px" }}>Payment Successful!</h1>
        <p style={{ color: "var(--muted)", marginBottom: "32px" }}>
          Your payment is held securely in escrow. The seller has been notified to ship your item.
        </p>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>Redirecting to your orders...</p>
      </div>
    );
  }

  if (error && !part) {
    return <div style={{ padding: "48px", textAlign: "center", color: "var(--red)" }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="display-font" style={{ fontSize: "40px", letterSpacing: "2px", marginBottom: "8px" }}>
        SECURE <span style={{ color: "var(--accent)" }}>CHECKOUT</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px" }}>Review your order and complete payment.</p>

      {error && (
        <div style={{ background: "rgba(255,61,61,0.1)", border: "1px solid var(--red)", padding: "16px", borderRadius: "8px", color: "var(--red)", marginBottom: "24px", display: "flex", gap: "10px", alignItems: "center" }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
        {/* Left Column: Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Shipping Address */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck size={20} color="var(--accent)" /> Shipping Address
            </h2>
            
            {addresses.length === 0 ? (
              <div style={{ background: "var(--surface2)", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", marginBottom: "16px", fontSize: "14px" }}>You don't have any saved addresses.</p>
                <button className="btn-ghost" onClick={() => router.push("/profile/buyer?tab=addresses&action=add")}>Go to Profile to Add Address</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {addresses.map(addr => (
                  <label key={addr.id} style={{ 
                    display: "flex", alignItems: "flex-start", gap: "12px", 
                    padding: "16px", border: selectedAddress === addr.id ? "2px solid var(--accent)" : "1px solid var(--border)", 
                    borderRadius: "8px", cursor: "pointer", background: selectedAddress === addr.id ? "rgba(232,255,0,0.05)" : "transparent"
                  }}>
                    <input 
                      type="radio" 
                      name="address" 
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      style={{ marginTop: "4px" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "14px" }}>
                        {addr.first_name} {addr.last_name} {addr.is_default && <span style={{ fontSize: "10px", background: "var(--surface2)", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px", color: "var(--muted)" }}>DEFAULT</span>}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "13px" }}>
                        {addr.address_line1}, {addr.city}, {addr.province} {addr.postal_code}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>Phone: {addr.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CreditCard size={20} color="var(--accent)" /> Payment Method
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label style={{ 
                padding: "16px", border: paymentMethod === "credit_card" ? "2px solid var(--accent)" : "1px solid var(--border)", 
                borderRadius: "8px", cursor: "pointer", textAlign: "center",
                background: paymentMethod === "credit_card" ? "rgba(232,255,0,0.05)" : "transparent"
              }}>
                <input type="radio" checked={paymentMethod === "credit_card"} onChange={() => setPaymentMethod("credit_card")} style={{ display: "none" }} />
                <div style={{ fontWeight: 600, fontSize: "14px" }}>Credit / Debit Card</div>
              </label>
              
              <label style={{ 
                padding: "16px", border: paymentMethod === "promptpay" ? "2px solid var(--accent)" : "1px solid var(--border)", 
                borderRadius: "8px", cursor: "pointer", textAlign: "center",
                background: paymentMethod === "promptpay" ? "rgba(232,255,0,0.05)" : "transparent"
              }}>
                <input type="radio" checked={paymentMethod === "promptpay"} onChange={() => setPaymentMethod("promptpay")} style={{ display: "none" }} />
                <div style={{ fontWeight: 600, fontSize: "14px" }}>PromptPay (QR)</div>
              </label>
            </div>

            {paymentMethod === "credit_card" && (
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase" }}>Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" style={{ width: "100%", fontFamily: "monospace" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase" }}>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase" }}>CVC</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "promptpay" && (
              <div style={{ marginTop: "24px", padding: "32px", background: "var(--surface2)", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", fontSize: "14px" }}>Mock QR Code will be generated here upon confirming the order.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ position: "sticky", top: "84px" }}>
          <div className="card" style={{ padding: "24px", background: "var(--surface)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>Order Summary</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{part?.name}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>L-{part?.id}</div>
              </div>
              <div style={{ fontWeight: 700 }}>฿{part?.price.toLocaleString()}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)", fontSize: "14px" }}>
              <span>Shipping Fee</span>
              <span>Free</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)", fontSize: "14px" }}>
              <span>Escrow Fee</span>
              <span>฿0</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", fontSize: "18px" }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>฿{part?.price.toLocaleString()}</span>
            </div>

            <button 
              className="btn-accent" 
              style={{ width: "100%", marginTop: "24px", padding: "14px", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? "Processing..." : "Pay Now & Secure Funds"}
            </button>
            <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", marginTop: "12px", lineHeight: "1.4" }}>
              Your payment is held in escrow and won't be released to the seller until you confirm receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}