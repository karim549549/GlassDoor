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

const SELECTED_THEME = {
  bg: "bg-orange",
  text: "text-white font-bold",
  border: "#0E0E0D",
  perforation: "stroke-white/80",
} as const;

const VARIANT_STYLES: Record<
  GoldenTicketVariant,
  { bg: string; text: string; border: string; perforation: string }
> = {
  emerald: {
    bg: "bg-[#E6F4EA]",
    text: "text-[#0D522C]",
    border: "#0D522C",
    perforation: "stroke-[#0D522C]/40",
  },
  cyan: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "#0369A1",
    perforation: "stroke-[#0369A1]/40",
  },
  purple: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#6B21A8]",
    border: "#6B21A8",
    perforation: "stroke-[#6B21A8]/40",
  },
  orange: {
    bg: "bg-[#FFEDD5]",
    text: "text-[#C2410C]",
    border: "#C2410C",
    perforation: "stroke-[#C2410C]/40",
  },
  ruby: {
    bg: "bg-[#FFE4E6]",
    text: "text-[#BE123C]",
    border: "#BE123C",
    perforation: "stroke-[#BE123C]/40",
  },
  golden: {
    bg: "bg-[#FEF9C3]",
    text: "text-[#854D0E]",
    border: "#854D0E",
    perforation: "stroke-[#854D0E]/40",
  },
  coupon: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "#0E0E0D",
    perforation: "stroke-[#0E0E0D]/40",
  },
  outline: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "#0E0E0D",
    perforation: "stroke-[#0E0E0D]/40",
  },
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", { padding: string; text: string; notch: number }> = {
  sm: {
    padding: "px-3 py-1",
    text: "text-[0.52rem] tracking-wider",
    notch: 4,
  },
  md: {
    padding: "px-4 py-1.5",
    text: "text-[0.6rem] tracking-wider",
    notch: 5,
  },
  lg: {
    padding: "px-5 py-2.5",
    text: "text-[0.72rem] tracking-widest",
    notch: 6,
  },
};

/**
 * Authentic Arcade Winner Coupon / Ticket Tag Component
 * Uses SVG radial semi-circle notch cutouts on the left & right edges
 * plus an inner dashed perforation line to create a real physical arcade ticket stub.
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
  const defaultTheme = isSelected
    ? SELECTED_THEME
    : VARIANT_STYLES[variant] || VARIANT_STYLES.coupon;

  const activeBg = bgColor || defaultTheme.bg;
  const activeText = textColor || defaultTheme.text;
  const activeBorderColor = borderColor || defaultTheme.border;
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

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
      {/* Real Arcade Ticket Stub Container with Inward Radial Semi-Circle Cutouts */}
      <div
        className={`relative flex items-center justify-center border-t-2 border-b-2 border-l-2 border-r-2 ${activeBg} ${activeText} ${sizeConfig.padding} ${sizeConfig.text}`}
        style={{
          borderColor: activeBorderColor,
          // Radial gradient mask producing genuine inward semi-circle ticket notches on left & right edges
          maskImage: `
            radial-gradient(circle at left center, transparent ${sizeConfig.notch}px, black ${sizeConfig.notch + 0.5}px),
            radial-gradient(circle at right center, transparent ${sizeConfig.notch}px, black ${sizeConfig.notch + 0.5}px)
          `,
          maskComposite: "intersect",
          WebkitMaskImage: `
            radial-gradient(circle at left center, transparent ${sizeConfig.notch}px, black ${sizeConfig.notch + 0.5}px),
            radial-gradient(circle at right center, transparent ${sizeConfig.notch}px, black ${sizeConfig.notch + 0.5}px)
          `,
          WebkitMaskComposite: "source-in",
        }}
      >
        {/* Left & Right Notch Border Curve Overlays */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
            borderColor: activeBorderColor,
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border-2 bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
            borderColor: activeBorderColor,
          }}
        />

        {/* Inner Dashed Perforation Line Overlay */}
        <div className="absolute inset-x-2 inset-y-1 border-t border-b border-dashed opacity-40 pointer-events-none" style={{ borderColor: activeBorderColor }} />

        {/* Tag Label Text */}
        <span className="relative z-10 truncate max-w-[220px]">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="relative z-10 ml-1.5 opacity-80 text-[0.88em]">({count})</span>
        )}
      </div>
    </button>
  );
}

export default GoldenTicketTag;
