import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "ModMatch",
  description: "Find guaranteed-fit car parts with escrow-protected payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 64px)" }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}