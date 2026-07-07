"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { removeSavedAccount } from "@/lib/client/saved-accounts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Bell, Settings, LogOut, User, MessageSquare } from "lucide-react";

interface NavUserMenuProps {
  isScrolled: boolean;
  isDarkTheme: boolean;
}

export function NavUserMenu({ isScrolled, isDarkTheme }: NavUserMenuProps) {
  const { user, clearAuth, notifications, markNotificationAsRead } = useAuthStore();
  const router = useRouter();
  const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);

  const executeSignOut = async (remember: boolean) => {
    setIsLogoutPromptOpen(false);

    if (!remember && user) {
      removeSavedAccount(user.email);
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors on sign out
    } finally {
      clearAuth();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-5">
      {user ? (
        <div className="flex items-center gap-3">
          {/* Chat Icon Button with Dropdown Popover */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button 
                  className={`p-1.5 rounded-full border border-transparent transition-all duration-200 cursor-pointer flex items-center justify-center relative hover:scale-105 active:scale-95 ${
                    isDarkTheme
                      ? "text-[#F1EFE9] hover:bg-[#F1EFE9]/15"
                      : "text-[#0E0E0D] hover:bg-[#0E0E0D]/10"
                  }`}
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                  {hasUnreadMessages && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-[#FF5C5C]" />
                  )}
                </button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-64 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              <div className="p-3 border-b border-[#0E0E0D] font-bold text-[#0E0E0D]/60 bg-[#FAF8F5]">
                Conversations
              </div>
              <div className="divide-y divide-[#0E0E0D]/5 max-h-48 overflow-y-auto">
                <DropdownMenuItem 
                  onClick={() => { setHasUnreadMessages(false); alert("Opening chat with Anwar..."); }}
                  className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-[#0E0E0D] hover:text-[#F1EFE9] focus:bg-[#0E0E0D] focus:text-[#F1EFE9] outline-none group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold">Anwar Moustafa</span>
                    <span className="text-[0.5rem] text-orange">New</span>
                  </div>
                  <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
                    "Hey, can you double check the Vodafone salary rates?"
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => alert("Opening chat with Karim...")}
                  className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-[#0E0E0D] hover:text-[#F1EFE9] focus:bg-[#0E0E0D] focus:text-[#F1EFE9] outline-none group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold">Karim Hassan</span>
                    <span className="text-[0.5rem] opacity-40">2h ago</span>
                  </div>
                  <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
                    "Let's review the mock data structure later today."
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Icon Button with Dropdown Popover */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button 
                  className={`p-1.5 rounded-full border border-transparent transition-all duration-200 cursor-pointer flex items-center justify-center relative hover:scale-105 active:scale-95 ${
                    isDarkTheme
                      ? "text-[#F1EFE9] hover:bg-[#F1EFE9]/15"
                      : "text-[#0E0E0D] hover:bg-[#0E0E0D]/10"
                  }`}
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-[#FF5C5C] animate-pulse" />
                  )}
                </button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-64 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              <div className="p-3 border-b border-[#0E0E0D] font-bold text-[#0E0E0D]/60 bg-[#FAF8F5]">
                Notifications
              </div>
              <div className="divide-y divide-[#0E0E0D]/5 max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground/60 italic lowercase normal-case">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-[#0E0E0D] hover:text-[#F1EFE9] focus:bg-[#0E0E0D] focus:text-[#F1EFE9] outline-none group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">Notification</span>
                        {!n.read && <span className="text-[0.5rem] text-orange">New</span>}
                      </div>
                      <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
                        {n.message}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={`relative flex h-7 w-7 items-center justify-center font-mono text-[0.7rem] font-bold border focus:outline-none transition-all duration-150 rounded-full cursor-pointer overflow-hidden hover:scale-105 active:scale-95 ${
              isDarkTheme
                ? "bg-[#F1EFE9] text-[#0E0E0D] border-[#F1EFE9]/20 hover:border-[#F1EFE9]"
                : "bg-[#0E0E0D] text-[#F1EFE9] border-[#0E0E0D]/25 hover:border-[#0E0E0D]"
            }`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()
              )}
            </DropdownMenuTrigger>
 
            <DropdownMenuContent
              align="end"
              className="w-72 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              {/* Clickable Profile Card Header */}
              <div 
                onClick={() => { window.location.href = `/user/${user.id}`; }}
                className="p-6 bg-[#FAF8F5] border-b border-[#0E0E0D] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FAF8F5]/30 transition-all duration-200 active:scale-[0.98] group"
              >
                {/* Large Circle Avatar inside Header */}
                <div className="w-16 h-16 rounded-full border border-[#0E0E0D] overflow-hidden bg-[#0E0E0D] text-[#F1EFE9] flex items-center justify-center font-mono text-[1.2rem] font-bold mb-3 shadow-[3px_3px_0px_0px_rgba(14,14,13,0.1)] group-hover:shadow-[1px_1px_0px_0px_rgba(14,14,13,0.1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:rotate-6 transition-all duration-300">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()
                  )}
                </div>
                
                <div className="font-bold text-[0.8rem] leading-none text-[#0E0E0D] tracking-tight lowercase first-letter:uppercase transition-transform duration-200 group-hover:scale-105">
                  {user.fullName || "Developer"}
                </div>
                <div className="text-muted-foreground text-[0.58rem] lowercase mt-1.5 truncate max-w-full">
                  {user.email}
                </div>
                
                <span className="text-[0.48rem] text-orange font-bold tracking-widest uppercase mt-3.5 opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300">
                  View Profile →
                </span>
              </div>

              {/* Menu Actions */}
              <div className="divide-y divide-[#0E0E0D]">
                <DropdownMenuItem
                  onClick={() => alert("Settings panel is under development.")}
                  className="flex items-center gap-2.5 p-3 cursor-pointer text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors rounded-none focus:bg-[#0E0E0D] focus:text-[#F1EFE9] outline-none group"
                >
                  <Settings className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:rotate-12" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsLogoutPromptOpen(true)}
                  className="flex items-center gap-2.5 p-3 cursor-pointer text-accent hover:bg-accent hover:text-[#F1EFE9] transition-colors rounded-none focus:bg-accent focus:text-[#F1EFE9] outline-none group"
                >
                  <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Link
          href="/signup"
          className="px-3.5 py-1.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.6rem] font-bold tracking-wider uppercase hover:bg-transparent hover:text-current transition-colors shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[3px_3px_0px_0px_currentColor] active:translate-y-0.5"
        >
          Join Us
        </Link>
      )}

          {/* Clean Brutalist Logout Confirmation Dialog */}
          <Dialog open={isLogoutPromptOpen} onOpenChange={setIsLogoutPromptOpen}>
            <DialogContent className="max-w-md p-8 bg-[#F1EFE9] border border-[#0E0E0D] rounded-none shadow-2xl font-mono text-[0.65rem] uppercase tracking-wider text-[#0E0E0D] z-50">
              <div className="space-y-4">
                <h3 className="font-display text-[1.2rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-[#0E0E0D]">
                  Remember this account?
                </h3>
                <p className="font-sans text-[0.7rem] text-muted-foreground leading-normal lowercase first-letter:uppercase">
                  Would you like to keep your account saved on this device for instant one-click login next time?
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => executeSignOut(true)}
                    className="py-2 border border-[#0E0E0D] bg-[#0E0E0D] text-[#F1EFE9] font-bold hover:bg-[#F1EFE9] hover:text-[#0E0E0D] transition-colors cursor-pointer text-center"
                  >
                    Yes, Remember
                  </button>
                  <button
                    onClick={() => executeSignOut(false)}
                    className="py-2 border border-[#0E0E0D] bg-transparent text-[#0E0E0D] font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer text-center"
                  >
                    No, Forget
                  </button>
                </div>
                <button
                  onClick={() => setIsLogoutPromptOpen(false)}
                  className="w-full text-center mt-2 font-mono text-[0.55rem] text-muted-foreground hover:text-foreground hover:underline cursor-pointer bg-transparent border-none py-1"
                >
                  Cancel Logout
                </button>
              </div>
            </DialogContent>
          </Dialog>
    </div>
  );
}

export default NavUserMenu;
