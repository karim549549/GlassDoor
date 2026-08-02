"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Bell } from "lucide-react";
import { useAuthStore } from "@/lib/client/useAuthStore";

type AuthUser = NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>;

interface BurgerMenuUserPanelProps {
  user: AuthUser | null;
  onClose: () => void;
}

/**
 * Mobile-only drawer section: signed-in user summary + chat/notification
 * shortcuts, or a "Join Us" link when signed out.
 */
export function BurgerMenuUserPanel({ user, onClose }: BurgerMenuUserPanelProps) {
  return (
    <div className="space-y-4 pt-2">
      <span className="font-mono text-[0.55rem] text-[#0E0E0D]/50 font-bold block">User Panel</span>
      {user ? (
        <div className="space-y-2.5">
          {/* User Monogram Header */}
          <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#0E0E0D]">
            <div className="relative w-8 h-8 rounded-full border border-[#0E0E0D] bg-[#0E0E0D] text-[#F1EFE9] flex items-center justify-center font-bold font-mono text-[0.7rem] overflow-hidden">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill sizes="32px" className="object-cover" />
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
              onClick={() => { onClose(); alert("Messages panel is under development."); }}
              className="p-2 border border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer font-mono text-[0.55rem] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chats</span>
            </button>
            <button
              onClick={() => { onClose(); alert("Notifications panel is under development."); }}
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
          onClick={onClose}
          className="w-full py-2.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.6rem] font-bold tracking-wider uppercase text-center block shadow-[2px_2px_0px_0px_#0E0E0D]"
        >
          Join Us
        </Link>
      )}
    </div>
  );
}

export default BurgerMenuUserPanel;
