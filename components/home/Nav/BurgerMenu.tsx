"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { removeSavedAccount } from "@/lib/client/saved-accounts";
import { logger } from "@/lib/client/logger";
import { NavSearch } from "./NavSearch";
import { NAV_LINKS } from "./nav-links-data";
import { BurgerMenuUserPanel } from "./BurgerMenuUserPanel";

interface BurgerMenuProps {
  isDarkTheme: boolean;
}

export function BurgerMenu({ isDarkTheme }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const executeSignOut = async () => {
    setIsOpen(false);
    if (user) {
      removeSavedAccount(user.email);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // Best-effort - the client still clears local auth state and navigates
      // away below regardless, but a server-side sign-out that keeps failing
      // (stale cookie never cleared) is worth a minimal signal.
      logger.warn("Server-side sign out failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      clearAuth();
      router.push("/");
      router.refresh();
    }
  };

  const linkClass = "font-mono text-[0.7rem] font-bold text-[#0E0E0D] hover:text-orange transition-colors uppercase tracking-wider block py-2.5 border-b border-[#0E0E0D]/10";

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger
        render={
          <button
            className={`p-1.5 border transition-all duration-150 cursor-pointer flex items-center justify-center ${
              isDarkTheme
                ? "bg-[#0E0E0D] text-[#F1EFE9] border-[#F1EFE9]/20 hover:border-[#F1EFE9]"
                : "bg-[#FAF8F5] text-[#0E0E0D] border-[#0E0E0D]/25 hover:border-[#0E0E0D] shadow-[2px_2px_0px_0px_currentColor] active:translate-y-0.5 active:shadow-none"
            }`}
            title="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        }
      />

      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200" />

        {/* Sliding Panel Content */}
        <DialogPrimitive.Popup className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#F1EFE9] border-l-2 border-[#0E0E0D] p-6 shadow-2xl flex flex-col justify-between outline-none transition-transform duration-200 animate-in slide-in-from-right">

          <div className="space-y-6">
            {/* Header: Close button */}
            <div className="flex items-center justify-between border-b border-[#0E0E0D] pb-3">
              <span className="font-display font-bold italic text-[1rem]">Navigation</span>
              <DialogPrimitive.Close
                render={
                  <button className="p-1 hover:bg-[#0E0E0D]/5 transition-colors cursor-pointer border-none bg-transparent">
                    <X className="h-4 w-4 text-[#0E0E0D]" />
                  </button>
                }
              />
            </div>

            {/* 1. Search Bar */}
            <div className="space-y-1">
              <span className="font-mono text-[0.55rem] text-[#0E0E0D]/50 font-bold block mb-1">Search site</span>
              <Suspense fallback={null}>
                <NavSearch isDarkTheme={false} />
              </Suspense>
            </div>

            {/* 2. Navigation links */}
            <div className="space-y-1">
              <span className="font-mono text-[0.55rem] text-[#0E0E0D]/50 font-bold block mb-1">Menu Tabs</span>
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)} className={linkClass}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 3. Mobile actions (Messages/Bell/Profile) */}
            {isMobile && <BurgerMenuUserPanel user={user} onClose={() => setIsOpen(false)} />}
          </div>

          {/* Drawer Footer / Sign Out */}
          {user && (
            <div className="border-t border-[#0E0E0D] pt-4">
              <button
                onClick={executeSignOut}
                className="w-full py-2.5 bg-[#FF5C5C] text-[#FAF8F5] border border-[#0E0E0D] font-mono text-[0.6rem] font-bold tracking-wider uppercase hover:bg-transparent hover:text-[#0E0E0D] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#0E0E0D] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default BurgerMenu;
