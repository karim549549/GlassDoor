"use client";

import Link from "next/link";
import React from "react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 select-none">
      <span className="font-display text-[1.15rem] tracking-tight font-bold text-current">
        Devs Arena
      </span>
    </Link>
  );
}

export default Logo;
