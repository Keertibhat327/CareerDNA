"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "glow";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:via-brand-400 hover:to-purple-500 text-white shadow-glow-sm hover:shadow-glow-md",
  secondary:
    "bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white shadow-glow-cyan hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]",
  ghost:
    "bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] hover:border-white/[0.15]",
  danger:
    "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  outline:
    "bg-transparent border border-brand-500/40 hover:border-brand-400/70 text-brand-400 hover:text-brand-300 hover:bg-brand-500/[0.08]",
  glow:
    "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow-lg hover:shadow-glow-xl border border-brand-400/30",
};

const sizes: Record<string, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3.5 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2",
  xl: "px-9 py-4 text-lg rounded-2xl gap-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.025 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.975 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "btn-glow inline-flex items-center justify-center font-semibold transition-all duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  );
}
