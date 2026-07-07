"use client";

import Link from "next/link";
import React from "react";

interface NavTabsProps {
  isDarkTheme: boolean;
}

export function NavTabs({ isDarkTheme }: NavTabsProps) {
  const linkClass = "font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity uppercase tracking-wider cursor-pointer text-current";
  
  return (
    <div className="hidden sm:flex items-center gap-5">
      <Link href="/" className={linkClass}>
        Companies
      </Link>
      <Link href="/" className={linkClass}>
        Reviews
      </Link>
      <Link href="/context" className={linkClass}>
        Context
      </Link>
    </div>
  );
}

export default NavTabs;
