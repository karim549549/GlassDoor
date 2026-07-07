"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Bell, MessageSquare, Settings, LogOut } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { removeSavedAccount } from "@/lib/client/saved-accounts";
import { NavSearch } from "./NavSearch";

interface BurgerMenuProps {
  isDarkTheme: boolean;
}

export function BurgerMenu({ isDarkTheme }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, clearAuth, notifications, markNotificationAsRead } = useAuthStore();
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
    } catch {
      // ignore
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
                <Link href="/" onClick={() => setIsOpen(false)} className={linkClass}>
                  Companies
                </Link>
                <Link href="/" onClick={() => setIsOpen(false)} className={linkClass}>
                  Reviews
                </Link>
                <Link href="/contest" onClick={() => setIsOpen(false)} className={linkClass}>
                  Arenas
                </Link>
              </nav>
            </div>

            {/* 3. Mobile actions (Messages/Bell/Profile) */}
            {isMobile && (
              <div className="space-y-4 pt-2">
                <span className="font-mono text-[0.55rem] text-[#0E0E0D]/50 font-bold block">User Panel</span>
                {user ? (
                  <div className="space-y-2.5">
                    {/* User Monogram Header */}
                    <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#0E0E0D]">
                      <div className="w-8 h-8 rounded-full border border-[#0E0E0D] bg-[#0E0E0D] text-[#F1EFE9] flex items-center justify-center font-bold font-mono text-[0.7rem] overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[0.65rem] truncate">{user.fullName || "Developer"}</span>
                        <span className="text-[0.55rem] text-muted-foreground truncate lowercase">{user.email}</span>
                      </div>
                    </div>

                    {/* Chat, Notifications, Actions Stack */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <button
                        onClick={() => { setIsOpen(false); alert("Messages panel is under development."); }}
                        className="p-2 border border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer font-mono text-[0.55rem] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chats</span>
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); alert("Notifications panel is under development."); }}
                        className="p-2 border border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer font-mono text-[0.55rem] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Bell className="h-3.5 w-3.5" />
                        <span>Alerts</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.6rem] font-bold tracking-wider uppercase text-center block shadow-[2px_2px_0px_0px_#0E0E0D]"
                  >
                    Join Us
                  </Link>
                )}
              </div>
            )}
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
