"use client";

import React from "react";

export interface GoldenTicketTagProps {
  label: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  variant?: "coupon" | "golden" | "emerald" | "cyan" | "purple" | "orange" | "ruby" | "outline";
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Newspaper Classified Coupon / Arcade Winner Coupon Tag Component
 * Features solid top/bottom rules, dashed left/right perforation borders,
 * crisp off-white sand background, and structural monospace bracketed tag text.
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
  // Preset Variant Styling (Defaulting to the Newspaper Classified Coupon aesthetic)
  const getVariantStyles = () => {
    if (isSelected) {
      return {
        bg: "bg-orange",
        text: "text-white font-bold",
        border: "border-[#0E0E0D]",
        dash: "border-white/60",
      };
    }

    switch (variant) {
      case "emerald":
        return {
          bg: "bg-[#E6F4EA]",
          text: "text-[#0D522C]",
          border: "border-[#0D522C]",
          dash: "border-[#0D522C]/40",
        };
      case "cyan":
        return {
          bg: "bg-[#E0F2FE]",
          text: "text-[#0369A1]",
          border: "border-[#0369A1]",
          dash: "border-[#0369A1]/40",
        };
      case "purple":
        return {
          bg: "bg-[#F3E8FF]",
          text: "text-[#6B21A8]",
          border: "border-[#6B21A8]",
          dash: "border-[#6B21A8]/40",
        };
      case "orange":
        return {
          bg: "bg-[#FFEDD5]",
          text: "text-[#C2410C]",
          border: "border-[#C2410C]",
          dash: "border-[#C2410C]/40",
        };
      case "ruby":
        return {
          bg: "bg-[#FFE4E6]",
          text: "text-[#BE123C]",
          border: "border-[#BE123C]",
          dash: "border-[#BE123C]/40",
        };
      case "golden":
        return {
          bg: "bg-[#FEF9C3]",
          text: "text-[#854D0E]",
          border: "border-[#854D0E]",
          dash: "border-[#854D0E]/40",
        };
      case "coupon":
      case "outline":
      default:
        return {
          bg: "bg-[#FAF8F5]",
          text: "text-[#0E0E0D]",
          border: "border-[#0E0E0D]",
          dash: "border-[#0E0E0D]/40",
        };
    }
  };

  const theme = getVariantStyles();
  const activeBg = bgColor || theme.bg;
  const activeText = textColor || theme.text;
  const activeBorder = borderColor || theme.border;

  // Size styling classes
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-2.5 py-0.5 text-[0.48rem] tracking-wider";
      case "lg":
        return "px-4 py-2 text-[0.68rem] tracking-widest";
      case "md":
      default:
        return "px-3.5 py-1 text-[0.56rem] tracking-wider";
    }
  };

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
        className={`relative flex items-center justify-center border-t-2 border-b-2 border-l-2 border-r-2 border-dashed ${theme.dash} ${activeBorder} ${activeBg} ${activeText} ${getSizeStyles()}`}
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
