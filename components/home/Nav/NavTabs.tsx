"use client";

import Link from "next/link";
import React from "react";
import { NAV_LINKS } from "./nav-links-data";

export function NavTabs() {
  const linkClass = "font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider cursor-pointer text-current";

  // No breakpoint of its own: the only caller already gates this behind
  // `hidden lg:flex`, so the `sm:` that used to be here described a state
  // that could not happen and read as though tabs appeared on phones.
  return (
    <div className="flex items-center gap-5">
      {NAV_LINKS.map((link) => (
        <Link key={link.label} href={link.href} className={linkClass}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default NavTabs;
