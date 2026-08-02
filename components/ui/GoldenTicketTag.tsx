"use client";

import React from "react";

export type GoldenTicketVariant =
  | "coupon"
  | "golden"
  | "emerald"
  | "cyan"
  | "purple"
  | "orange"
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

// Newspaper Classified Coupon Theme Map - Pixel-perfect match for cairo_editorial_tag_concepts mockup
const VARIANT_STYLES: Record<
  GoldenTicketVariant,
  { bg: string; text: string; border: string }
> = {
  golden: {
    bg: "bg-[#FEF9C3]",
    text: "text-[#A16207]",
    border: "border-[#A16207]",
  },
  emerald: {
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    border: "border-[#15803D]",
  },
  cyan: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#0369A1]",
  },
  purple: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#7E22CE]",
    border: "border-[#7E22CE]",
  },
  orange: {
    bg: "bg-[#FFEDD5]",
    text: "text-[#C2410C]",
    border: "border-[#C2410C]",
  },
  ruby: {
    bg: "bg-[#FFE4E6]",
    text: "text-[#BE123C]",
    border: "border-[#BE123C]",
  },
  coupon: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
  },
  outline: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
  },
};

const SELECTED_THEME = {
  bg: "bg-[#0E0E0D]",
  text: "text-[#FAF8F5]",
  border: "border-[#0E0E0D]",
};

// Sizing configurations scaled up for high legibility on large screens
const SIZE_CONFIGS = {
  sm: "px-3 py-1 text-[0.62rem] sm:text-[0.68rem] tracking-wider",
  md: "px-4 py-1.5 text-[0.72rem] sm:text-[0.80rem] tracking-wider",
  lg: "px-5 py-2 text-[0.85rem] sm:text-[0.92rem] tracking-widest",
};

/**
 * Newspaper Classified Coupon Tag Component
 * Pixel-perfect match for the Cairo Editorial plan design (solid top/bottom borders,
 * dashed left/right perforation rules, pastel colorways, and structural monospace brackets).
 */
export function GoldenTicketTag({
  label,
  count,
  size = "md",
  bgColor,
  textColor,
  borderColor,
  variant = "golden",
  isSelected = false,
  onClick,
  className = "",
}: GoldenTicketTagProps) {
  const defaultTheme = isSelected
    ? SELECTED_THEME
    : VARIANT_STYLES[variant] || VARIANT_STYLES.coupon;

  const activeBg = bgColor || defaultTheme.bg;
  const activeText = textColor || defaultTheme.text;
  const activeBorder = borderColor || defaultTheme.border;
  const sizeClass = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`relative inline-flex items-center justify-center font-mono uppercase font-bold transition-all duration-150 select-none ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0E0E0D] active:translate-y-0"
          : "cursor-default"
      } ${className}`}
    >
      {/* Newspaper Coupon Box: Solid Top/Bottom Rules, Dashed Left/Right Perforated Borders */}
      <div
        className={`relative flex items-center justify-center border-t-2 border-b-2 border-l-2 border-r-2 border-dashed ${activeBorder} ${activeBg} ${activeText} ${sizeClass}`}
        style={{
          borderTopStyle: "solid",
          borderBottomStyle: "solid",
          borderLeftStyle: "dashed",
          borderRightStyle: "dashed",
        }}
      >
        <span className="truncate max-w-[280px]">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="ml-1.5 opacity-80 font-mono text-[0.88em]">({count})</span>
        )}
      </div>
    </button>
  );
}

export default GoldenTicketTag;
