"use client";

import { useEffect, useState } from "react";
import { NavBrand } from "./NavBrand";
import { NavUserMenu } from "./NavUserMenu";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-[#0E0E0D] text-[#F1EFE9] border-b border-[#F1EFE9]/10 shadow-sm"
        : "bg-transparent text-[#0E0E0D]"
    }`}>
      <div className={`flex items-center justify-between h-11 transition-all duration-300 ${
        isScrolled ? "px-40" : "px-6"
      }`}>
        <NavBrand isScrolled={isScrolled} />
        <NavUserMenu isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

export default Nav;
