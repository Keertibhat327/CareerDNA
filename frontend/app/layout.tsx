import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "CareerDNA AI — Smart Career Intelligence Platform",
  description:
    "Discover your career potential with AI-powered skill matching, ATS scoring, and intelligent job recommendations.",
  keywords: ["career", "AI", "jobs", "skills", "ATS", "resume"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {/* ── Ambient background system ─────────────────────────────────── */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
            {/* Base gradient */}
            <div className="absolute inset-0 bg-[#020408]" />

            {/* Primary orbs */}
            <div className="orb w-[700px] h-[700px] bg-brand-700 top-[-250px] left-[-200px] animate-float-slow opacity-[0.10]" />
            <div className="orb w-[600px] h-[600px] bg-purple-700 bottom-[-200px] right-[-150px] animate-float opacity-[0.10]" style={{ animationDelay: "2s" }} />
            <div className="orb w-[400px] h-[400px] bg-cyan-700 top-[35%] left-[55%] animate-float-slow opacity-[0.07]" style={{ animationDelay: "4s" }} />
            <div className="orb w-[300px] h-[300px] bg-emerald-700 top-[60%] left-[20%] animate-float opacity-[0.06]" style={{ animationDelay: "1s" }} />

            {/* Mesh grid */}
            <div className="mesh-grid absolute inset-0 opacity-100" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,4,8,0.8)_100%)]" />
          </div>

          {/* Noise texture */}
          <div className="noise-overlay" aria-hidden />

          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
