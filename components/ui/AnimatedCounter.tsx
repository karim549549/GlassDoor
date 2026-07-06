"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface AnimatedCounterProps {
  value: string;
}

export function AnimatedCounter({ value }: AnimatedCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Extract numerical digits for animation
    const numericString = value.replace(/[^0-9]/g, "");
    if (!numericString) return;

    const targetValue = parseInt(numericString, 10);
    const suffix = value.replace(/[0-9,]/g, ""); // e.g. "+" or "%"
    const hasCommas = value.includes(",");

    const countObj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(countObj, {
        val: targetValue,
        duration: 2.0,
        ease: "power2.out", // Starts fast and slows down smoothly
        onUpdate: () => {
          const formatted = Math.floor(countObj.val)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, hasCommas ? "," : "");
          setDisplayValue(`${formatted}${suffix}`);
        },
      });
    }, elementRef);

    return () => ctx.revert();
  }, [value]);

  return <span ref={elementRef}>{displayValue}</span>;
}
export default AnimatedCounter;
