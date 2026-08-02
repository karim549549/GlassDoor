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

const VARIANT_STYLES: Record<
  GoldenTicketVariant,
  { bg: string; text: string; border: string; dash: string }
> = {
  coupon: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
    dash: "border-[#0E0E0D]/45",
  },
  golden: {
    bg: "bg-[#FEF9C3]",
    text: "text-[#A16207]",
    border: "border-[#A16207]",
    dash: "border-[#A16207]/45",
  },
  emerald: {
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    border: "border-[#15803D]",
    dash: "border-[#15803D]/45",
  },
  cyan: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#0369A1]",
    dash: "border-[#0369A1]/45",
  },
  purple: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#7E22CE]",
    border: "border-[#7E22CE]",
    dash: "border-[#7E22CE]/45",
  },
  orange: {
    bg: "bg-[#FFEDD5]",
    text: "text-[#C2410C]",
    border: "border-[#C2410C]",
    dash: "border-[#C2410C]/45",
  },
  ruby: {
    bg: "bg-[#FFE4E6]",
    text: "text-[#BE123C]",
    border: "border-[#BE123C]",
    dash: "border-[#BE123C]/45",
  },
  outline: {
    bg: "bg-[#FAF8F5]",
    text: "text-[#0E0E0D]",
    border: "border-[#0E0E0D]",
    dash: "border-[#0E0E0D]/45",
  },
};

const SELECTED_THEME = {
  bg: "bg-[#0E0E0D]",
  text: "text-[#FAF8F5]",
  border: "border-[#0E0E0D]",
  dash: "border-[#FAF8F5]/60",
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
 * Exact match for the reference image: Solid 2px outer border, inward radial semi-circle notch cutouts on left & right,
 * vertical dashed perforation lines on left & right inside, and centered bracketed mono text.
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
  const activeBorderClass = borderColor ? `border-[${borderColor}]` : defaultTheme.border;
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
        className={`relative flex items-center justify-center border-2 ${activeBorderClass} ${activeBg} ${activeText} ${sizeConfig.padding} ${sizeConfig.text}`}
        style={{
          // Radial gradient mask carving out inward semi-circles on left & right edges
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-current bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Right Curved Notch Border Overlay */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-current bg-transparent pointer-events-none"
          style={{
            width: sizeConfig.notch * 2 + "px",
            height: sizeConfig.notch * 2 + "px",
          }}
        />

        {/* Left Vertical Dashed Perforation Line */}
        <div className={`absolute top-0 bottom-0 left-3 sm:left-3.5 border-r-2 border-dashed ${defaultTheme.dash} pointer-events-none`} />

        {/* Right Vertical Dashed Perforation Line */}
        <div className={`absolute top-0 bottom-0 right-3 sm:right-3.5 border-l-2 border-dashed ${defaultTheme.dash} pointer-events-none`} />

        {/* Centered Bracketed Monospace Tag Text */}
        <span className="relative z-10 truncate max-w-[260px] text-center">
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
