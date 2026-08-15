"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

export interface StarRatingProps {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  max?: number;
}

/** A generic 1-5 star rating component with optional interactive hover preview. */
export function StarRating({
  label,
  value,
  onChange,
  readOnly = false,
  max = 5,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </span>
      <div className="flex gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            aria-label={`${label}: ${star} star${star > 1 ? "s" : ""}`}
            className={`p-1 focus:outline-none ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
            }`}
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                star <= (hovered || value)
                  ? "text-orange fill-orange"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default StarRating;
