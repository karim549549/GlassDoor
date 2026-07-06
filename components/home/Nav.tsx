"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut } from "lucide-react";

export function Nav() {
  const { user, clearAuth, notifications, markNotificationAsRead } = useAuthStore();
  const router = useRouter();


  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
      router.push("/");
      router.refresh();
    } catch {
      // Ignore errors on sign out
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-foreground text-primary-foreground">
      <div className="px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-[1.1rem]">Sherh</span>
            <span className="font-mono text-[0.6rem] text-orange tracking-[0.2em]">
              شرح
            </span>
          </Link>
          <span className="font-mono text-[0.6rem] opacity-35 border-l border-primary-foreground/20 pl-3 hidden sm:block">
            Egypt tech · salary transparency
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Companies
          </a>
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Reviews
          </a>
          <Link
            href="/context"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Context
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex h-7 w-7 items-center justify-center bg-primary-foreground text-foreground font-mono text-[0.7rem] font-bold border border-primary-foreground/20 hover:border-primary-foreground cursor-pointer focus:outline-none transition-all duration-150 rounded-none">
                {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 bg-[#F1EFE9] text-[#0E0E0D] border border-[#0E0E0D] rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50"
              >
                {/* Profile Header */}
                <div className="p-3.5 border-b border-[#0E0E0D]">
                  <div className="font-bold text-[0.7rem] leading-none text-[#0E0E0D]">
                    {user.fullName || "User Profile"}
                  </div>
                  <div className="text-muted-foreground text-[0.55rem] lowercase mt-1.5 truncate">
                    {user.email}
                  </div>
                </div>

                {/* Notifications Panel Header */}
                <div className="px-3.5 py-2 bg-[#E4E1D9] flex items-center justify-between border-b border-[#0E0E0D] text-[0.52rem]">
                  <span className="font-bold flex items-center gap-1.5">
                    <Bell className="h-3 w-3 text-orange" />
                    Notifications ({notifications.filter(n => !n.read).length})
                  </span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notifications.forEach(n => markNotificationAsRead(n.id));
                      }}
                      className="text-orange hover:underline cursor-pointer bg-transparent border-none p-0 text-[0.48rem] uppercase font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-40 overflow-y-auto divide-y divide-[#0E0E0D]/10">
                  {notifications.length === 0 ? (
                    <div className="p-3.5 text-center text-muted-foreground text-[0.52rem]">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(n.id);
                        }}
                        className={`p-3 text-left transition-colors cursor-pointer hover:bg-[#E4E1D9]/40 flex items-start gap-2 ${
                          !n.read ? "bg-orange/5 font-semibold" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="leading-tight text-[#0E0E0D] text-[0.56rem] lowercase first-letter:uppercase truncate">
                            {n.message}
                          </p>
                          <span className="text-[0.48rem] text-muted-foreground mt-0.5 block">
                            {n.date}
                          </span>
                        </div>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-orange mt-1 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <DropdownMenuSeparator className="bg-[#0E0E0D] my-0" />

                {/* Settings Trigger */}
                <DropdownMenuItem
                  onClick={() => alert("Settings panel is under development.")}
                  className="flex items-center gap-2.5 p-3 cursor-pointer text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors rounded-none focus:bg-[#0E0E0D] focus:text-[#F1EFE9]"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#0E0E0D] my-0" />

                {/* Sign Out Trigger */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 p-3 cursor-pointer text-accent hover:bg-accent hover:text-[#F1EFE9] transition-colors rounded-none focus:bg-accent focus:text-[#F1EFE9]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
