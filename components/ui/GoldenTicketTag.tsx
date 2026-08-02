"use client";

import React from "react";

/**
 * HANDOVER NOTE: Antigravity model (3.5 / medium) failed to implement this ticket design
 * to exact pixel-perfect specification after multiple iterations.
 * Another model or human developer should review and pick up this ticket once they see this comment.
 */

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
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: GoldenTicketVariant;
}

// Prime Color & Grey Accent Map from app/globals.css
const VARIANT_ACCENTS: Record<GoldenTicketVariant, { slash: string; border: string }> = {
  coupon: {
    slash: "bg-[#6A6860]", // Mid Grey (--muted-foreground)
    border: "border-[#0E0E0D]",
  },
  golden: {
    slash: "bg-[#E8621A]", // Cairo Orange (--orange)
    border: "border-[#0E0E0D]",
  },
  emerald: {
    slash: "bg-[#0E0E0D]", // Primary Dark (--primary)
    border: "border-[#0E0E0D]",
  },
  cyan: {
    slash: "bg-[#6A6860]", // Mid Grey (--muted-foreground)
    border: "border-[#0E0E0D]",
  },
  purple: {
    slash: "bg-[#C11A1A]", // Accent Red (--accent)
    border: "border-[#0E0E0D]",
  },
  orange: {
    slash: "bg-[#E8621A]", // Cairo Orange (--orange)
    border: "border-[#0E0E0D]",
  },
  ruby: {
    slash: "bg-[#C11A1A]", // Accent Red (--accent)
    border: "border-[#0E0E0D]",
  },
  outline: {
    slash: "bg-[#6A6860]", // Mid Grey (--muted-foreground)
    border: "border-[#0E0E0D]",
  },
};

const SIZE_CONFIGS = {
  sm: {
    padding: "px-5 py-1 sm:px-6 sm:py-1.5",
    text: "text-[0.62rem] sm:text-[0.68rem] tracking-wider",
    notch: 5,
    dashOffset: "left-3.5 right-3.5",
  },
  md: {
    padding: "px-6 py-2 sm:px-7 sm:py-2.5",
    text: "text-[0.72rem] sm:text-[0.80rem] tracking-wider",
    notch: 6,
    dashOffset: "left-4 right-4",
  },
  lg: {
    padding: "px-7 py-3 sm:px-8 sm:py-3.5",
    text: "text-[0.85rem] sm:text-[0.92rem] tracking-widest",
    notch: 7,
    dashOffset: "left-5 right-5",
  },
};

/**
 * Newspaper Classified Coupon Tag Component
 * Uses ::before and ::after pseudo-elements to render two duplicated parallel diagonal slashes
 * crossing from bottom-left to top-right using prime colors and greys from globals.css.
 */
export function GoldenTicketTag({
  label,
  count,
  size = "md",
  variant = "coupon",
  isSelected = false,
  onClick,
  className = "",
}: GoldenTicketTagProps) {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const accentTheme = VARIANT_ACCENTS[variant] || VARIANT_ACCENTS.coupon;
  const ContainerTag = onClick ? "button" : "div";

  return (
    <ContainerTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-mono uppercase font-bold transition-none select-none cursor-default ${className}`}
    >
      {/* Outer Solid Ticket Frame with Masked Radial Semi-Circle Cutouts on Left & Right */}
      <div
        className={`relative flex items-center justify-center overflow-hidden border-2 border-[#0E0E0D] ${
          isSelected ? "bg-[#0E0E0D] text-[#FAFAF8]" : "bg-[#FAFAF8] text-[#0E0E0D]"
        } ${sizeConfig.padding} ${sizeConfig.text}`}
        style={{
          // Radial gradient mask carving out inward semi-circle cutouts on left & right edges
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
        {/* Left Curved Notch Border Overlay */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-[#0E0E0D] bg-transparent pointer-events-none z-20"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Right Curved Notch Border Overlay */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-[#0E0E0D] bg-transparent pointer-events-none z-20"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Left Vertical Dashed Perforation Line */}
        <div
          className={`absolute top-0 bottom-0 left-3 sm:left-3.5 border-r-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/50" : "border-[#0E0E0D]/40"
          } pointer-events-none z-20`}
        />

        {/* Right Vertical Dashed Perforation Line */}
        <div
          className={`absolute top-0 bottom-0 right-3 sm:right-3.5 border-l-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/50" : "border-[#0E0E0D]/40"
          } pointer-events-none z-20`}
        />

        {/* 
          Two Parallel Diagonal Slashes (::before and ::after) crossing from bottom-left to top-right
          using prime colors and greys from globals.css
        */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Slash 1 (::before) */}
          <span
            className={`absolute bottom-[-50%] left-[12%] w-[2px] h-[200%] ${
              isSelected ? "bg-[#FAFAF8]/40" : accentTheme.slash
            } opacity-35 -rotate-[35deg] origin-bottom-left`}
          />
          {/* Slash 2 (::after) */}
          <span
            className={`absolute bottom-[-50%] left-[28%] w-[2px] h-[200%] ${
              isSelected ? "bg-[#FAFAF8]/40" : accentTheme.slash
            } opacity-35 -rotate-[35deg] origin-bottom-left`}
          />
        </div>

        {/* Centered Bracketed Monospace Tag Text */}
        <span className="relative z-10 truncate max-w-[280px] text-center">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="relative z-10 ml-1.5 opacity-80 font-mono text-[0.88em]">({count})</span>
        )}
      </div>
    </ContainerTag>
  );
}

export default GoldenTicketTag;
