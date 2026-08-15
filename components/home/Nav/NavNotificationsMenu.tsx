"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, type NotificationItem } from "@/lib/client/useAuthStore";
import { logger } from "@/lib/client/logger";

interface NavNotificationsMenuProps {
  isDarkTheme: boolean;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
}

interface NotificationApiItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

function toNotificationItem(dto: NotificationApiItem): NotificationItem {
  return {
    id: dto.id,
    kind: dto.kind,
    title: dto.title,
    message: dto.body,
    linkUrl: dto.linkUrl,
    read: dto.read,
    date: dto.createdAt,
  };
}

/**
 * Only same-origin paths are followed. `linkUrl` is written by our own
 * services today, but a stored absolute URL is one bad migration away from
 * being an open redirect out of a trusted menu — so the menu refuses anything
 * that is not a root-relative path.
 */
function isSafeInternalPath(url: string | null): url is string {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//");
}

function formatWhen(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Real inbox, backed by GET /api/notifications. The route derives the owner
 * from the session, so there is no user id to pass from here.
 */
export function NavNotificationsMenu({ isDarkTheme, notifications, onMarkAsRead }: NavNotificationsMenuProps) {
  const router = useRouter();
  const setNotifications = useAuthStore((s) => s.setNotifications);
  const markAllInStore = useAuthStore((s) => s.markAllNotificationsAsRead);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notifications?pageSize=10");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setNotifications(
          (data.notifications as NotificationApiItem[]).map(toNotificationItem),
          data.unreadCount ?? 0
        );
        setHasFailed(false);
      } catch (err) {
        if (cancelled) return;
        setHasFailed(true);
        logger.warn("Failed to load notifications", {
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setNotifications]);

  const handleSelect = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.read) {
        onMarkAsRead(notification.id);
        try {
          await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [notification.id] }),
          });
        } catch (err) {
          logger.warn("Failed to mark notification read", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
      if (isSafeInternalPath(notification.linkUrl)) {
        router.push(notification.linkUrl);
      }
    },
    [onMarkAsRead, router]
  );

  const handleMarkAll = useCallback(async () => {
    markAllInStore();
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      logger.warn("Failed to mark all notifications read", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [markAllInStore]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={`p-1.5 rounded-full border border-transparent transition-all duration-200 cursor-pointer flex items-center justify-center relative hover:scale-105 active:scale-95 ${
              isDarkTheme
                ? "text-background hover:bg-background/15"
                : "text-foreground hover:bg-foreground/10"
            }`}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
            )}
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-72 bg-background text-foreground border border-foreground rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
      >
        <div className="p-3 border-b border-foreground font-bold text-foreground/60 bg-card flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[0.55rem] text-orange hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="divide-y divide-foreground/5 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground/60 italic lowercase normal-case">
              Loading…
            </div>
          ) : hasFailed ? (
            <div className="p-4 text-center text-muted-foreground/60 italic lowercase normal-case">
              Could not load notifications.
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground/60 italic lowercase normal-case">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleSelect(n)}
                className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none group"
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-bold text-left">{n.title}</span>
                  {!n.read && <span className="text-[0.5rem] text-orange shrink-0">New</span>}
                </div>
                <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
                  {n.message}
                </span>
                <span className="text-[0.5rem] opacity-50 lowercase normal-case">
                  {formatWhen(n.date)}
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
