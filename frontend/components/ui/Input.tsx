"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export default function Input({
  label,
  error,
  icon,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-white/70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "input-glow w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30",
            "py-3 text-sm transition-all duration-200",
            icon ? "pl-10 pr-4" : "px-4",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-white/40">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
