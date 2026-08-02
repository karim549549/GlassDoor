"use client";

import React from "react";

export interface GoldenTicketTagProps {
  label: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  variant?: "golden" | "emerald" | "cyan" | "purple" | "orange" | "ruby" | "outline";
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 4-Sided Sawtooth Wavy "Golden Ticket" UI Badge Component
 * Modeled after the iconic Wonka Golden Ticket with serrated sawtooth edges running along
 * all 4 sides (top, right, bottom, left) and clean inside tag text.
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
  // Preset Variant Colors
  const getVariantStyles = () => {
    switch (variant) {
      case "emerald":
        return {
          bg: "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500",
          text: "text-emerald-950",
          border: "border-emerald-950",
        };
      case "cyan":
        return {
          bg: "bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500",
          text: "text-cyan-950",
          border: "border-cyan-950",
        };
      case "purple":
        return {
          bg: "bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500",
          text: "text-purple-950",
          border: "border-purple-950",
        };
      case "orange":
        return {
          bg: "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
          text: "text-orange-950",
          border: "border-orange-950",
        };
      case "ruby":
        return {
          bg: "bg-gradient-to-r from-rose-400 via-red-400 to-rose-500",
          text: "text-rose-950",
          border: "border-rose-950",
        };
      case "outline":
        return {
          bg: "bg-[#FAF8F5]",
          text: "text-[#0E0E0D]",
          border: "border-[#0E0E0D]",
        };
      case "golden":
      default:
        return {
          bg: "bg-gradient-to-r from-[#F5E096] via-[#D4AF37] to-[#C5A059]",
          text: "text-[#1C1604]",
          border: "border-[#1C1604]",
        };
    }
  };

  const defaultTheme = getVariantStyles();
  const activeBg = bgColor || defaultTheme.bg;
  const activeText = textColor || defaultTheme.text;
  const activeBorder = borderColor || defaultTheme.border;

  // Size styling classes
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1 text-[0.48rem] tracking-wider";
      case "lg":
        return "px-5 py-2.5 text-[0.68rem] tracking-widest";
      case "md":
      default:
        return "px-4 py-1.5 text-[0.58rem] tracking-wider";
    }
  };

  return (
    <button
      type={onClick ? "button" : "button"}
      onClick={onClick}
      disabled={!onClick}
      className={`relative inline-flex items-center justify-center font-mono font-bold uppercase transition-all duration-150 select-none ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0E0E0D] active:translate-y-0" : "cursor-default"
      } ${isSelected ? "ring-2 ring-orange ring-offset-2 scale-105" : "opacity-95 hover:opacity-100"} ${className}`}
    >
      {/* Sawtooth Wavy Ticket Outer Box */}
      <div
        className={`relative flex items-center justify-center border-2 ${activeBorder} ${activeBg} ${activeText} ${getSizeStyles()}`}
        style={{
          // SVG mask / polygon clip path creating sawtooth serrated edges around all 4 sides
          clipPath: `polygon(
            0% 4px, 4px 0%, 8px 4px, 12px 0%, 16px 4px, 20px 0%, 24px 4px, 28px 0%, 32px 4px, 36px 0%, 40px 4px, 44px 0%, 48px 4px, 52px 0%, 56px 4px, 60px 0%, 64px 4px, 68px 0%, 72px 4px, 76px 0%, 80px 4px, 84px 0%, 88px 4px, 92px 0%, 96px 4px, 100% 0%,
            calc(100% - 4px) 4px, 100% 8px, calc(100% - 4px) 12px, 100% 16px, calc(100% - 4px) 20px, 100% 24px, calc(100% - 4px) 28px, 100% 32px, calc(100% - 4px) 36px, 100% 40px, calc(100% - 4px) 44px, 100% 48px, calc(100% - 4px) 52px, 100% 56px, calc(100% - 4px) 60px, 100% 64px, calc(100% - 4px) 68px, 100% 72px, calc(100% - 4px) 76px, 100% 80px, calc(100% - 4px) 84px, 100% 88px, calc(100% - 4px) 92px, 100% 96px, calc(100% - 4px) 100%,
            96px calc(100% - 4px), 92px 100%, 88px calc(100% - 4px), 84px 100%, 80px calc(100% - 4px), 76px 100%, 72px calc(100% - 4px), 68px 100%, 64px calc(100% - 4px), 60px 100%, 56px calc(100% - 4px), 52px 100%, 48px calc(100% - 4px), 44px 100%, 40px calc(100% - 4px), 36px 100%, 32px calc(100% - 4px), 28px 100%, 24px calc(100% - 4px), 20px 100%, 16px calc(100% - 4px), 12px 100%, 8px calc(100% - 4px), 4px 100%, 0% calc(100% - 4px),
            4px 96px, 0% 92px, 4px 88px, 0% 84px, 4px 80px, 0% 76px, 4px 72px, 0% 68px, 4px 64px, 0% 60px, 4px 56px, 0% 52px, 4px 48px, 0% 44px, 4px 40px, 0% 36px, 4px 32px, 0% 28px, 4px 24px, 0% 20px, 4px 16px, 0% 12px, 4px 8px, 0% 4px
          )`,
        }}
      >
        {/* Ticket Content Label */}
        <span className="truncate max-w-[200px]">{label}</span>
        {count !== undefined && (
          <span className="ml-1.5 opacity-75 font-mono text-[0.85em]">({count})</span>
        )}
      </div>
    </button>
  );
}

export default GoldenTicketTag;
