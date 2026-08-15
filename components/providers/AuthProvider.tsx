"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { upsertSavedAccount } from "@/lib/client/saved-accounts";
import { logger } from "@/lib/client/logger";

/**
 * Resolves the viewer client-side, on mount.
 *
 * Hydrating this from the server render was tried and reverted: reading the
 * session in app/layout.tsx opts the whole route tree into dynamic rendering,
 * which cost `/`, `/billboard`, and `/arena/create` their static prerender and
 * made the homepage's `revalidate = 3600` dead code. Since a page cached for an
 * hour is shared across users, it cannot carry per-user nav anyway — so
 * resolving auth on the client is the correct layer here, not a shortcut.
 *
 * The cost is a brief signed-out paint in the Nav on first load. If that
 * becomes worth removing, the fix is a Suspense/PPR boundary around the Nav,
 * not a session read in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAuth(data.user, data.roles);
          // Only the email and display name are stored - never a token.
          // See lib/client/saved-accounts.ts for why that matters.
          upsertSavedAccount({
            email: data.user.email,
            name: data.user.fullName || data.user.email.split("@")[0],
          });
        } else {
          clearAuth();
        }
      } catch (err) {
        logger.error("Auth status check failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        clearAuth();
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}

export default AuthProvider;
