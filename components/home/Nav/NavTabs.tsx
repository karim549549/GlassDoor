"use client";

import Link from "next/link";
import React from "react";
import { NAV_LINKS } from "./nav-links-data";

interface NavTabsProps {
  isDarkTheme: boolean;
}

export function NavTabs({ isDarkTheme }: NavTabsProps) {
  const linkClass = "font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider cursor-pointer text-current";

  return (
    <div className="hidden sm:flex items-center gap-5">
      {NAV_LINKS.map((link) => (
        <Link key={link.label} href={link.href} className={linkClass}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default NavTabs;
