"use client";

import React from "react";

export type GoldenTicketVariant =
  | "coupon"
  | "golden"
  | "emerald"
  | "cyan"
  | "purple" | "orange"
  | "ruby"
  | "outline";

export interface GoldenTicketTagProps {
  label: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  variant?: GoldenTicketVariant;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Module-level static theme lookup maps (allocated once at module load, zero re-render overhead)
const SELECTED_THEME = {
  bg: "bg-orange",
  text: "text-white font-bold",
  border: "border-[#0E0E0D]",
  dash: "border-white/60",
} as const;

const VARIANT_STYLES: Record<GoldenTicketVariant, { bg: string; text: string; border: string; dash: string }> = {
  emerald: {
    bg: "bg-[#E6F4EA]",
    text: "text-[#0D522C]",
    border: "border-[#0D522C]",
    dash: "border-[#0D522C]/40",
  },
  cyan: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#0369A1]",
    dash: "border-[#0369A1]/40",
  },
  purple: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#6B21A8]",
    border: "border-[#6B21A8]",
    dash: "border-[#6B21A8]/40",
  },
  orange: {
    bg: "bg-[#FFEDD5]",
    text: "text-[#C2410C]",
    border: "border-[#C2410C]",
    dash: "border-[#C2410C]/40",
  },
  ruby: {
    bg: "bg-[#FFE4E6]",
    text: "text-[#BE123C]",
    border: "border-[#BE123C]",
    dash: "border-[#BE123C]/40",
  },
  golden: {
    bg: "bg-[#FEF9C3]",
    text: "text-[#854D0E]",
    border: "border-[#854D0E]",
    dash: "border-[#854D0E]/40",
  },
  coupon: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
    dash: "border-[#0E0E0D]/40",
  },
  outline: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
    dash: "border-[#0E0E0D]/40",
  },
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-0.5 text-[0.48rem] tracking-wider",
  md: "px-3.5 py-1 text-[0.56rem] tracking-wider",
  lg: "px-4 py-2 text-[0.68rem] tracking-widest",
};

/**
 * Newspaper Classified Coupon / Arcade Winner Coupon Tag Component
 * Optimized zero-allocation render execution with static top-level theme lookups.
 */
export function GoldenTicketTag({
  label,
  count,
  size = "md",
  bgColor,
  textColor,
  borderColor,
  variant = "coupon",
  isSelected = false,
  onClick,
  className = "",
}: GoldenTicketTagProps) {
  const defaultTheme = isSelected ? SELECTED_THEME : VARIANT_STYLES[variant] || VARIANT_STYLES.coupon;

  const activeBg = bgColor || defaultTheme.bg;
  const activeText = textColor || defaultTheme.text;
  const activeBorder = borderColor || defaultTheme.border;
  const activeDash = defaultTheme.dash;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`relative inline-flex items-center justify-center font-mono uppercase font-bold transition-all duration-150 select-none ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0"
          : "cursor-default"
      } ${className}`}
    >
      {/* Classified Coupon Frame with Perforated Left & Right Dashed Borders */}
      <div
        className={`relative flex items-center justify-center border-t-2 border-b-2 border-l-2 border-r-2 border-dashed ${activeDash} ${activeBorder} ${activeBg} ${activeText} ${sizeClass}`}
        style={{
          borderLeftStyle: "dashed",
          borderRightStyle: "dashed",
          borderTopStyle: "solid",
          borderBottomStyle: "solid",
        }}
      >
        <span className="truncate max-w-[220px]">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="ml-1.5 opacity-75 text-[0.88em]">({count})</span>
        )}
      </div>
    </button>
  );
}

export default GoldenTicketTag;
