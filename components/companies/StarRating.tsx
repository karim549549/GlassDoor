"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

/** A single 1-5 star rating row with hover preview, used inside the ratings section. */
export function StarRating({ label, value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${label}: ${star} star${star > 1 ? "s" : ""}`}
            className="p-1 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
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
