"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState<"buyer" | "seller" | "admin">("buyer");

  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      padding: "0 32px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span className="display-font" style={{ fontSize: "28px", letterSpacing: "2px", color: "var(--accent)" }}>
          MOD<span style={{ color: "var(--text)" }}>MATCH</span>
        </span>
      </Link>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Link href="/search" style={{ color: "var(--muted)", textDecoration: "none", padding: "6px 14px", fontSize: "14px" }}>
          Search Parts
        </Link>
        <Link href="/listings" style={{ color: "var(--muted)", textDecoration: "none", padding: "6px 14px", fontSize: "14px" }}>
          Listings
        </Link>

        {/* Role switcher — dev helper */}
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as typeof role);
          }}
          style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
        >
          <option value="buyer">Buyer View</option>
          <option value="seller">Seller View</option>
          <option value="admin">Admin View</option>
        </select>

        {role === "seller" && (
          <Link href="/seller/dashboard">
            <button className="btn-ghost" style={{ padding: "8px 16px" }}>Seller Dashboard</button>
          </Link>
        )}
        {role === "admin" && (
          <Link href="/admin/dashboard">
            <button className="btn-ghost" style={{ padding: "8px 16px" }}>Admin Dashboard</button>
          </Link>
        )}

        <button className="btn-accent" style={{ padding: "8px 18px" }}>Sign In</button>
      </div>
    </nav>
  );
}