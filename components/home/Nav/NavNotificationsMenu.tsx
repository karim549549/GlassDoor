"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { NotificationItem } from "@/lib/client/useAuthStore";

interface NavNotificationsMenuProps {
  isDarkTheme: boolean;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
}

export function NavNotificationsMenu({ isDarkTheme, notifications, onMarkAsRead }: NavNotificationsMenuProps) {
  return (
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
                onClick={() => onMarkAsRead(n.id)}
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
  );
}

export default NavNotificationsMenu;
