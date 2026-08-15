import React from "react";
import { Logo } from "./Logo";

interface NavBrandProps {
  isScrolled: boolean;
  isDarkTheme: boolean;
}

export function NavBrand({ isScrolled, isDarkTheme }: NavBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <span className={`font-mono text-[0.6rem] opacity-35 border-l pl-3 hidden sm:block transition-colors duration-300 ${
        isDarkTheme ? "border-background/20" : "border-foreground/20"
      }`}>
        Developer competitions &bull; hiring credentials
      </span>
    </div>
  );
}
