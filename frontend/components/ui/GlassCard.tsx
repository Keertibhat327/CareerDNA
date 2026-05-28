"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useRef, useState } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "purple" | "blue" | "cyan" | "green" | "amber" | "none";
  padding?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
  tilt?: boolean;
  depth?: "flat" | "raised" | "floating";
}

const glowStyles: Record<string, string> = {
  purple: "hover:shadow-glow-purple hover:border-purple-500/35",
  blue:   "hover:shadow-glow-md hover:border-brand-500/35",
  cyan:   "hover:shadow-glow-cyan hover:border-cyan-500/35",
  green:  "hover:shadow-glow-green hover:border-emerald-500/35",
  amber:  "hover:shadow-glow-amber hover:border-amber-500/35",
  none:   "",
};

const depthStyles: Record<string, string> = {
  flat:     "shadow-glass",
  raised:   "shadow-card-3d",
  floating: "shadow-deep",
};

const paddingMap: Record<string, string> = {
  none: "",
  xs:   "p-3",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
  xl:   "p-10",
};

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = "blue",
  padding = "md",
  tilt = false,
  depth = "raised",
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 8);
    setRotateY(x * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef as any}
      className={cn(
        "glass-card rounded-2xl border border-white/[0.07] transition-all duration-300 relative overflow-hidden",
        hover && !tilt && "card-3d cursor-default",
        glow !== "none" && glowStyles[glow],
        depthStyles[depth],
        paddingMap[padding],
        className
      )}
      style={
        tilt
          ? {
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: isHovered ? "transform 0.1s ease" : "transform 0.4s ease",
            }
          : undefined
      }
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseEnter={tilt ? () => setIsHovered(true) : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      {...props}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
