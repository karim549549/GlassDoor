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

// Compact sizing with tight padding so inner dashed lines sit close to the tag text
const SIZE_CONFIGS = {
  sm: {
    padding: "px-4 py-1 sm:px-4.5 sm:py-1",
    text: "text-[0.62rem] sm:text-[0.68rem] tracking-wider",
    notch: 4,
    dashPosition: "left-2.5 right-2.5",
  },
  md: {
    padding: "px-5 py-1.5 sm:px-6 sm:py-2",
    text: "text-[0.72rem] sm:text-[0.80rem] tracking-wider",
    notch: 5,
    dashPosition: "left-3 right-3",
  },
  lg: {
    padding: "px-6 py-2.5 sm:px-7 sm:py-3",
    text: "text-[0.82rem] sm:text-[0.90rem] tracking-widest",
    notch: 6,
    dashPosition: "left-3.5 right-3.5",
  },
};

/**
 * Pixel-Perfect Newspaper Classified Coupon Tag Component
 * Inner dashed lines take 100% full height touching top and bottom borders,
 * positioned closely around the bracketed mono text.
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

        {/* Left Vertical Dashed Line - Full 100% Height Touching Top & Bottom Borders */}
        <div
          className={`absolute h-full top-0 bottom-0 left-2.5 sm:left-3 border-r-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/60" : "border-[#0E0E0D]/40"
          } pointer-events-none`}
        />

        {/* Right Vertical Dashed Line - Full 100% Height Touching Top & Bottom Borders */}
        <div
          className={`absolute h-full top-0 bottom-0 right-2.5 sm:right-3 border-l-2 border-dashed ${
            isSelected ? "border-[#FAFAF8]/60" : "border-[#0E0E0D]/40"
          } pointer-events-none`}
        />

        {/* Centered Bracketed Tag Text Sitting Close to Dashed Lines */}
        <span className="relative z-10 truncate max-w-[320px] text-center px-1">
          [ {label} ]
        </span>
        {count !== undefined && (
          <span className="relative z-10 ml-1 opacity-80 font-mono text-[0.88em]">({count})</span>
        )}
      </div>
    </ContainerTag>
  );
}

export default GoldenTicketTag;
