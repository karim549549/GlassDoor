import React, { useId } from "react";

interface BackgroundGridProps {
  className?: string;
  opacity?: number;
  patternSize?: number;
  strokeWidth?: number;
  /** Grid line color; defaults to the surrounding text color so it adapts to light/dark surfaces. */
  stroke?: string;
}

export function BackgroundGrid({
  className = "",
  opacity = 0.18,
  patternSize = 30,
  strokeWidth = 0.55,
  stroke = "currentColor",
}: BackgroundGridProps) {
  // Unique per instance so multiple grids on one page don't collide on DOM id.
  const patternId = `blueprint-grid-${useId()}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

export default BackgroundGrid;
