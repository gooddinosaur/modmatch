"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, ChevronDown, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileHref = user?.role === "seller" ? `/seller/${user.id}` : "/profile/buyer";
  const homeHref = "/search";

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
      <Link href={user ? homeHref : "/"} style={{ textDecoration: "none" }}>
        <span className="display-font" style={{ fontSize: "28px", letterSpacing: "2px", color: "var(--accent)" }}>
          MOD<span style={{ color: "var(--text)" }}>MATCH</span>
        </span>
      </Link>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {user && (
          <Link href="/search" style={{ color: "var(--muted)", textDecoration: "none", padding: "6px 14px", fontSize: "14px" }}>
            Search Parts
          </Link>
        )}

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
              <>
                <Link href="/seller/dashboard">
                  <button className="btn-ghost" style={{ padding: "8px 16px" }}>Dashboard</button>
                </Link>
                <Link href="/seller/dashboard?tab=new">
                  <button className="btn-ghost" style={{ padding: "8px 16px" }}>Add Listings</button>
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link href="/admin/dashboard">
                <button className="btn-ghost" style={{ padding: "8px 16px" }}>Admin Dashboard</button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                className="btn-ghost"
                style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.role !== "admin" && <User size={14} />}
                <span style={{ fontSize: "13px" }}>{user.email.split("@")[0]}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minWidth: "160px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 100,
                  }}
                >
                  {user.role !== "admin" && (
                    <Link href={profileHref} onClick={() => setDropdownOpen(false)} style={{ textDecoration: "none" }}>
                      <div className="btn-ghost" style={{ width: "100%", textAlign: "left", padding: "8px 12px", fontSize: "13px" }}>
                        My Profile
                      </div>
                    </Link>
                  )}
                  <button
                    className="btn-ghost"
                    style={{ width: "100%", textAlign: "left", margin: 0, padding: "8px 12px", color: "var(--red)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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