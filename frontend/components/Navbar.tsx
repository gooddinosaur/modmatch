"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  const profileHref = user?.role === "seller" ? "/profile/seller" : "/profile/buyer";

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

        {user ? (
          <>
            {/* Role badge */}
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "1px",
              padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase",
              background: user.role === "admin" ? "rgba(255,77,0,0.15)" : user.role === "seller" ? "rgba(232,255,0,0.12)" : "rgba(0,230,118,0.12)",
              color: user.role === "admin" ? "var(--accent2)" : user.role === "seller" ? "var(--accent)" : "var(--green)",
            }}>
              {user.role}
            </span>

            {user.role === "seller" && (
              <Link href="/seller/dashboard">
                <button className="btn-ghost" style={{ padding: "8px 16px" }}>Dashboard</button>
              </Link>
            )}
            {user.role === "admin" && (
              <Link href="/admin/dashboard">
                <button className="btn-ghost" style={{ padding: "8px 16px" }}>Admin Panel</button>
              </Link>
            )}

            {/* Profile link */}
            {user.role !== "admin" && (
              <Link href={profileHref}>
                <button className="btn-ghost" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} />
                  <span style={{ fontSize: "13px" }}>{user.email.split("@")[0]}</span>
                </button>
              </Link>
            )}

            <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={logout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="btn-ghost" style={{ padding: "8px 16px" }}>Sign In</button>
            </Link>
            <Link href="/register">
              <button className="btn-accent" style={{ padding: "8px 18px" }}>Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}