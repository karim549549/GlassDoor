"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { removeSavedAccount } from "@/lib/client/saved-accounts";
import { NavMessagesMenu } from "./NavMessagesMenu";
import { NavNotificationsMenu } from "./NavNotificationsMenu";
import { NavProfileMenu } from "./NavProfileMenu";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

interface NavUserMenuProps {
  isScrolled: boolean;
  isDarkTheme: boolean;
}

export function NavUserMenu({ isDarkTheme }: NavUserMenuProps) {
  const { user, clearAuth, notifications, markNotificationAsRead } = useAuthStore();
  const router = useRouter();
  const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);

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
          <NavMessagesMenu isDarkTheme={isDarkTheme} />
          <NavNotificationsMenu
            isDarkTheme={isDarkTheme}
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
          />
          <NavProfileMenu
            user={user}
            isDarkTheme={isDarkTheme}
            onSignOutClick={() => setIsLogoutPromptOpen(true)}
          />
        </div>
      ) : (
        <Link
          href="/signup"
          className="px-3.5 py-1.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.6rem] font-bold tracking-wider uppercase hover:bg-transparent hover:text-current transition-colors shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[3px_3px_0px_0px_currentColor] active:translate-y-0.5"
        >
          Join Us
        </Link>
      )}

      <LogoutConfirmDialog
        isOpen={isLogoutPromptOpen}
        onOpenChange={setIsLogoutPromptOpen}
        onConfirm={executeSignOut}
      />
    </div>
  );
}

export default NavUserMenu;
