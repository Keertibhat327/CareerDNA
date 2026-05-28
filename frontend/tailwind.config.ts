import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5b8fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        neon: {
          purple: "#a855f7",
          blue:   "#3b82f6",
          cyan:   "#06b6d4",
          green:  "#10b981",
          pink:   "#ec4899",
          amber:  "#f59e0b",
        },
        dark: {
          950: "#010204",
          900: "#020408",
          800: "#060d18",
          700: "#0a1628",
          600: "#0f1f3d",
          500: "#162447",
          400: "#1e3460",
        },
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":    "linear-gradient(135deg, #020408 0%, #0a1628 40%, #162447 100%)",
        "card-gradient":    "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.04) 100%)",
        "glow-gradient":    "radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, transparent 70%)",
        "aurora":           "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1), rgba(6,182,212,0.1))",
        "surface":          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "glow-xs":     "0 0 8px rgba(99,102,241,0.3)",
        "glow-sm":     "0 0 12px rgba(99,102,241,0.4)",
        "glow-md":     "0 0 24px rgba(99,102,241,0.5), 0 0 48px rgba(99,102,241,0.15)",
        "glow-lg":     "0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2)",
        "glow-xl":     "0 0 60px rgba(99,102,241,0.7), 0 0 120px rgba(99,102,241,0.25)",
        "glow-purple": "0 0 24px rgba(168,85,247,0.5), 0 0 48px rgba(168,85,247,0.15)",
        "glow-cyan":   "0 0 24px rgba(6,182,212,0.5), 0 0 48px rgba(6,182,212,0.15)",
        "glow-green":  "0 0 24px rgba(16,185,129,0.5), 0 0 48px rgba(16,185,129,0.15)",
        "glow-amber":  "0 0 24px rgba(245,158,11,0.5), 0 0 48px rgba(245,158,11,0.15)",
        "glass":       "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-lg":    "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card-3d":     "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)",
        "card-hover":  "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.1)",
        "inner-glow":  "inset 0 0 30px rgba(99,102,241,0.08)",
        "deep":        "0 40px 100px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.5)",
      },
      animation: {
        "float":          "float 6s ease-in-out infinite",
        "float-slow":     "floatSlow 9s ease-in-out infinite",
        "pulse-glow":     "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow":      "spin 10s linear infinite",
        "spin-slower":    "spin 16s linear infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "shimmer":        "shimmer 2.5s linear infinite",
        "slide-up":       "slideUpFade 0.5s ease-out",
        "breathe":        "breathe 4s ease-in-out infinite",
        "orbit":          "orbit 12s linear infinite",
        "scan":           "scanLine 3s linear infinite",
        "count-up":       "countUp 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-18px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(1deg)" },
          "66%":      { transform: "translateY(-6px) rotate(-1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUpFade: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%":      { transform: "scale(1.05)", opacity: "1" },
        },
        orbit: {
          "0%":   { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        countUp: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "4xl": "72px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
