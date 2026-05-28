"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color?: string;
  delay?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  color = "#6366f1",
  delay = 0,
  className,
  size = "md",
}: StatCardProps) {
  const trendColor =
    trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendBg =
    trend === "up" ? "rgba(16,185,129,0.1)" : trend === "down" ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.1)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "glass-card rounded-2xl border border-white/[0.07] relative overflow-hidden group cursor-default",
        size === "sm" ? "p-4" : size === "lg" ? "p-8" : "p-5",
        className
      )}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, ${color}18 0%, transparent 65%)`,
        }}
      />

      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      {/* Bottom depth shadow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${color}08, transparent)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{label}</p>
          <motion.p
            className={cn(
              "font-black text-white stat-number leading-none",
              size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-3xl"
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
          >
            {value}
          </motion.p>
          {change && (
            <div
              className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: trendBg, color: trendColor }}
            >
              <span>{trendIcon}</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        <motion.div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}25`,
            boxShadow: `0 0 20px ${color}15, inset 0 1px 0 ${color}20`,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Subtle corner accent */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl opacity-[0.06] pointer-events-none"
        style={{ background: color }}
      />
    </motion.div>
  );
}
