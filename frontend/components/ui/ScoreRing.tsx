"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
  showScore?: boolean;
  animate?: boolean;
  glowIntensity?: "low" | "medium" | "high";
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  showLabel = true,
  showScore = true,
  animate: shouldAnimate = true,
  glowIntensity = "medium",
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  const glowMap = {
    low:    `drop-shadow(0 0 4px ${color}80)`,
    medium: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}60)`,
    high:   `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}80) drop-shadow(0 0 40px ${color}40)`,
  };

  const fontSize = size < 80 ? "text-lg" : size < 100 ? "text-xl" : "text-2xl";
  const labelSize = size < 80 ? "text-[10px]" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow behind ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }}
          animate={shouldAnimate ? { opacity: [0.4, 0.8, 0.4] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer decorative ring */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 opacity-20"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2 + 3}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            strokeDasharray="3 6"
          />
        </svg>

        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Track inner shadow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={strokeWidth - 2}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldAnimate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
            style={{ filter: glowMap[glowIntensity] }}
          />
          {/* Highlight dot at end of arc */}
          {score > 5 && (
            <motion.circle
              cx={size / 2 + radius * Math.cos((2 * Math.PI * score) / 100 - Math.PI / 2)}
              cy={size / 2 + radius * Math.sin((2 * Math.PI * score) / 100 - Math.PI / 2)}
              r={strokeWidth / 2 + 1}
              fill={color}
              initial={shouldAnimate ? { opacity: 0, scale: 0 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, duration: 0.3 }}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showScore && (
            <motion.span
              className={`font-black text-white stat-number leading-none ${fontSize}`}
              initial={shouldAnimate ? { opacity: 0, scale: 0.6 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              {score}%
            </motion.span>
          )}
          {showLabel && (
            <motion.span
              className={`font-semibold mt-0.5 ${labelSize}`}
              style={{ color }}
              initial={shouldAnimate ? { opacity: 0 } : {}}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {scoreLabel}
            </motion.span>
          )}
        </div>
      </div>

      {label && (
        <motion.span
          className="text-sm font-medium text-white/60 text-center leading-tight max-w-[100px]"
          initial={shouldAnimate ? { opacity: 0, y: 4 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
