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
    <div className={`flex-1 flex flex-col ${isBleedPage ? "" : "pt-11"}`}>
      {children}
    </div>
  );
}

export default LayoutSpacer;
