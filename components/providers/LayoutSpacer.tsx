"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function LayoutSpacer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that are full-bleed (no top spacer/margin needed)
  const isBleedPage =
    pathname === "/" ||
    pathname.startsWith("/user/") ||
    pathname.startsWith("/companies/");

  return (
    // The skip link's target. Not a <main> itself: several pages render their
    // own, and nesting one inside another would give the document two main
    // landmarks. tabIndex -1 lets the skip link actually move focus here
    // rather than only moving the scroll position.
    <div
      id="main-content"
      tabIndex={-1}
      className={`flex-1 flex flex-col outline-none ${isBleedPage ? "" : "pt-11"}`}
    >
      {children}
    </div>
  );
}

export default LayoutSpacer;
