"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { NavBrand } from "./NavBrand";
import { NavTabs } from "./NavTabs";
import { NavSearch } from "./NavSearch";
import { NavUserMenu } from "./NavUserMenu";

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

        {/* Middle Section: Navigation Tabs & Search */}
        <div className="flex items-center gap-6">
          <NavTabs isDarkTheme={isDarkTheme} />
          <Suspense fallback={null}>
            <NavSearch isDarkTheme={isDarkTheme} />
          </Suspense>
        </div>

        {/* Right Section: User Menu & Actions */}
        <NavUserMenu isScrolled={isScrolled} isDarkTheme={isDarkTheme} />
      </div>
    </nav>
  );
}

export default Nav;

