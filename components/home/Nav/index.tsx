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
  const isArenaPage = pathname.startsWith("/arena");
  const forceDarkNavbar = isScrolled || isArenaPage;

  // isDarkTheme = true means navbar text should be light (#F1EFE9), suitable for dark backgrounds
  const isDarkTheme = forceDarkNavbar || isCoverPage;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      forceDarkNavbar
        ? "bg-foreground text-background border-b border-background/10 shadow-sm"
        : isCoverPage
          ? "bg-transparent text-background"
          : "bg-transparent text-foreground"
    }`}>
      {/* The same rail every page uses, rather than a padding jump.

          This was `isScrolled ? "md:px-40 px-6" : "px-6"` - 160px of padding a
          side from 768px up, the moment anyone scrolled. On a tablet that left
          about 450px for the entire bar, so the brand, the tabs and the user
          menu collided into the middle of an otherwise empty strip, and did it
          abruptly on the first scroll event. It also disagreed with the content
          underneath it, which runs to 1700px.

          The bar still marks the scrolled state, by tightening its own height
          instead - a change nothing has to collide over. */}
      <div
        className={`mx-auto flex w-[92%] max-w-[1700px] items-center justify-between transition-all duration-300 xl:w-[80%] ${
          isScrolled ? "h-11" : "h-14"
        }`}
      >
        {/* Left Section: Branding */}
        <NavBrand isDarkTheme={isDarkTheme} />

        {/* Center Section: Search on Left, Tabs on Right (Desktop only) */}
        <div className="hidden lg:flex items-center gap-6">
          <Suspense fallback={null}>
            <NavSearch isDarkTheme={isDarkTheme} />
          </Suspense>
          <NavTabs />
        </div>

        {/* Right Section: User Menu / Actions & Responsive Burger Menu */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* One boundary, not two.

              The user menu appeared from `md` while the burger stayed until
              `lg`, so every tablet between 768px and 1023px got both - two
              ways to reach the same account actions side by side, one of them
              a panel that also lists the links the other is hiding. `lg` is
              the line: below it the burger owns navigation and account, above
              it the bar does. */}
          <div className="hidden lg:flex items-center">
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

