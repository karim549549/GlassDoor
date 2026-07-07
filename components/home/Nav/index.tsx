"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { NavBrand } from "./NavBrand";
import { NavTabs } from "./NavTabs";
import { NavSearch } from "./NavSearch";
import { NavUserMenu } from "./NavUserMenu";
import { BurgerMenu } from "./BurgerMenu";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCoverPage = pathname.startsWith("/user/") || pathname.startsWith("/companies/");

  // isDarkTheme = true means navbar text should be light (#F1EFE9), suitable for dark backgrounds
  const isDarkTheme = isScrolled || isCoverPage;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-[#0E0E0D] text-[#F1EFE9] border-b border-[#F1EFE9]/10 shadow-sm"
        : isCoverPage
          ? "bg-transparent text-[#F1EFE9]"
          : "bg-transparent text-[#0E0E0D]"
    }`}>
      <div className={`flex items-center justify-between h-11 transition-all duration-300 ${
        isScrolled ? "px-40" : "px-6"
      }`}>
        {/* Left Section: Branding */}
        <NavBrand isScrolled={isScrolled} isDarkTheme={isDarkTheme} />

        {/* Center Section: Search on Left, Tabs on Right (Desktop only) */}
        <div className="hidden lg:flex items-center gap-6">
          <Suspense fallback={null}>
            <NavSearch isDarkTheme={isDarkTheme} />
          </Suspense>
          <NavTabs isDarkTheme={isDarkTheme} />
        </div>

        {/* Right Section: User Menu / Actions & Responsive Burger Menu */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* User Menu Actions: Visible on Tablet/Desktop (>= md), Hidden on Mobile (< md) */}
          <div className="hidden md:flex items-center">
            <NavUserMenu isScrolled={isScrolled} isDarkTheme={isDarkTheme} />
          </div>

          {/* Burger Menu Trigger: Visible on Tablet/Mobile (< lg), Hidden on Desktop (>= lg) */}
          <div className="lg:hidden flex items-center">
            <BurgerMenu isDarkTheme={isDarkTheme} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;

