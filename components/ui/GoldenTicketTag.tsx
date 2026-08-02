"use client";

import React from "react";

export type GoldenTicketVariant =
  | "golden"
  | "coupon"
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

// Unified Golden Color Theme (Identical to the Golden Ticket design)
const UNIFIED_GOLDEN_THEME = {
  bg: "bg-gradient-to-r from-[#F5E096] via-[#D4AF37] to-[#C5A059]",
  text: "text-[#1C1604]",
  border: "#1C1604",
  perforation: "stroke-[#1C1604]/40",
} as const;

const SELECTED_GOLDEN_THEME = {
  bg: "bg-[#1C1604]",
  text: "text-[#F5E096]",
  border: "#F5E096",
  perforation: "stroke-[#F5E096]/60",
} as const;

// Scaled-up size configurations for enhanced legibility on larger screens
const SIZE_CONFIGS = {
  sm: {
    padding: "px-3.5 py-1 sm:px-4 sm:py-1.5",
    text: "text-[0.62rem] sm:text-[0.68rem] tracking-wider",
    notch: 6,
    borderWidth: 2,
  },
  md: {
    padding: "px-5 py-2 sm:px-6 sm:py-2.5",
    text: "text-[0.72rem] sm:text-[0.82rem] tracking-wider",
    notch: 7,
    borderWidth: 2,
  },
  lg: {
    padding: "px-6 py-3 sm:px-8 sm:py-3.5",
    text: "text-[0.85rem] sm:text-[0.95rem] tracking-widest",
    notch: 8,
    borderWidth: 3,
  },
} as const;

/**
 * Wonka Golden Ticket Tag Component
 * Unified on the golden foil aesthetic with larger, high-visibility sizing for desktop screens,
 * sharp radial ticket cutouts, and crisp monospace bracket typography.
 */
export function GoldenTicketTag({
  label,
  count,
  size = "md",
  bgColor,
  textColor,
  borderColor,
  isSelected = false,
  onClick,
  className = "",
}: GoldenTicketTagProps) {
  const theme = isSelected ? SELECTED_GOLDEN_THEME : UNIFIED_GOLDEN_THEME;

  const activeBg = bgColor || theme.bg;
  const activeText = textColor || theme.text;
  const activeBorderColor = borderColor || theme.border;
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`relative inline-flex items-center justify-center font-mono uppercase font-bold transition-all duration-150 select-none ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1C1604] active:translate-y-0"
          : "cursor-default"
      } ${className}`}
    >
      {/* Golden Ticket Stub Container with Inward Radial Semi-Circle Cutouts */}
      <div
        className={`relative flex items-center justify-center border-t-2 border-b-2 border-l-2 border-r-2 ${activeBg} ${activeText} ${sizeConfig.padding} ${sizeConfig.text}`}
        style={{
          borderColor: activeBorderColor,
          // Radial gradient mask producing sharp inward ticket notch cutouts on left & right edges
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
        {/* Curved Border Overlay on Left & Right Cutout Notches */}
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

        {/* Inner Ticket Perforation Line Overlay */}
        <div
          className="absolute inset-x-2.5 inset-y-1 border-t border-b border-dashed opacity-35 pointer-events-none"
          style={{ borderColor: activeBorderColor }}
        />

        {/* Tag Content Label */}
        <span className="relative z-10 truncate max-w-[300px] flex items-center gap-1">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="relative z-10 ml-2 opacity-85 text-[0.88em]">({count})</span>
        )}
      </div>
    </button>
  );
}

export default GoldenTicketTag;
