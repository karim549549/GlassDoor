"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/client/useAuthStore";

type AuthUser = NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>;

interface NavProfileMenuProps {
  user: AuthUser;
  isDarkTheme: boolean;
  onSignOutClick: () => void;
}

export function NavProfileMenu({ user, isDarkTheme, onSignOutClick }: NavProfileMenuProps) {
  const initials = user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`relative flex h-7 w-7 items-center justify-center font-mono text-[0.7rem] font-bold border focus:outline-none transition-all duration-150 rounded-full cursor-pointer overflow-hidden hover:scale-105 active:scale-95 ${
        isDarkTheme
          ? "bg-[#F1EFE9] text-[#0E0E0D] border-[#F1EFE9]/20 hover:border-[#F1EFE9]"
          : "bg-[#0E0E0D] text-[#F1EFE9] border-[#0E0E0D]/25 hover:border-[#0E0E0D]"
      }`}>
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="Avatar" fill sizes="28px" className="object-cover" />
        ) : (
          initials
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
          <div className="relative w-16 h-16 rounded-full border border-[#0E0E0D] overflow-hidden bg-[#0E0E0D] text-[#F1EFE9] flex items-center justify-center font-mono text-[1.2rem] font-bold mb-3 shadow-[3px_3px_0px_0px_rgba(14,14,13,0.1)] group-hover:shadow-[1px_1px_0px_0px_rgba(14,14,13,0.1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:rotate-6 transition-all duration-300">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="Avatar" fill sizes="64px" className="object-cover" />
            ) : (
              initials
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
            onClick={onSignOutClick}
            className="flex items-center gap-2.5 p-3 cursor-pointer text-accent hover:bg-accent hover:text-[#F1EFE9] transition-colors rounded-none focus:bg-accent focus:text-[#F1EFE9] outline-none group"
          >
            <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavProfileMenu;
