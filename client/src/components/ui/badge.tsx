import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    success: "bg-emerald-900/50 text-emerald-400 border-emerald-700",
    warning: "bg-amber-900/50 text-amber-400 border-amber-700",
    error: "bg-red-900/50 text-red-400 border-red-700",
    info: "bg-blue-900/50 text-blue-400 border-blue-700",
    neutral: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
