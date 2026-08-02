"use client";

import React from "react";

export interface GoldenTicketTagProps {
  label: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Sizing configurations with pixel-perfect responsive dimensions for large screens
const SIZE_CONFIGS = {
  sm: {
    padding: "px-5 py-1.5 sm:px-6 sm:py-2",
    text: "text-[0.65rem] sm:text-[0.72rem] tracking-wider",
    notch: 5,
    dashOffset: "left-3.5 right-3.5",
  },
  md: {
    padding: "px-6 py-2.5 sm:px-8 sm:py-3",
    text: "text-[0.75rem] sm:text-[0.85rem] tracking-wider",
    notch: 6,
    dashOffset: "left-4 right-4",
  },
  lg: {
    padding: "px-8 py-3 sm:px-10 sm:py-4",
    text: "text-[0.88rem] sm:text-[0.98rem] tracking-widest",
    notch: 8,
    dashOffset: "left-5 right-5",
  },
};

/**
 * Pixel-Perfect Newspaper Classified Coupon Tag Component
 * Unified base platform styling across all tags (Card background #FAFAF8, Foreground ink #0E0E0D).
 * Features solid 2px outer border, inward radial semi-circle notch cutouts on left & right,
 * vertical dashed perforation lines on left & right inside, and centered bracketed mono text.
 */
export function GoldenTicketTag({
  label,
  count,
  size = "md",
  isSelected = false,
  onClick,
  className = "",
}: GoldenTicketTagProps) {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const ContainerTag = onClick ? "button" : "div";

  return (
    <ContainerTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-mono uppercase font-bold transition-none select-none cursor-default ${className}`}
    >
      {/* Outer Solid Ticket Frame with Masked Radial Semi-Circle Cutouts on Left & Right */}
      <div
        className={`relative flex items-center justify-center border-2 border-[#0E0E0D] ${
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-[#0E0E0D] bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Right Curved Notch Border Overlay */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-[#0E0E0D] bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Left Vertical Dashed Perforation Line */}
        <div
          className={`absolute top-0 bottom-0 left-3 sm:left-4 border-r-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/50" : "border-[#0E0E0D]/40"
          } pointer-events-none`}
        />

        {/* Right Vertical Dashed Perforation Line */}
        <div
          className={`absolute top-0 bottom-0 right-3 sm:right-4 border-l-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/50" : "border-[#0E0E0D]/40"
          } pointer-events-none`}
        />

        {/* Centered Bracketed Monospace Tag Text */}
        <span className="relative z-10 truncate max-w-[320px] text-center">
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
