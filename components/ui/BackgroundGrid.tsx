import React from "react";

interface BackgroundGridProps {
  className?: string;
  opacity?: number;
  patternSize?: number;
  strokeWidth?: number;
}

export function BackgroundGrid({
  className = "",
  opacity = 0.18,
  patternSize = 30,
  strokeWidth = 0.55,
}: BackgroundGridProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="blueprint-grid"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
              fill="none"
              stroke="#0E0E0D"
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>
    </div>
  );
}

export default BackgroundGrid;
