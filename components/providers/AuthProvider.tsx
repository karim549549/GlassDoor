"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { upsertSavedAccount } from "@/lib/client/saved-accounts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAuth(data.user, data.roles);
          upsertSavedAccount({
            email: data.user.email,
            name: data.user.fullName || data.user.email.split("@")[0],
            refreshToken: data.session?.refreshToken || null,
          });
        } else {
          clearAuth();
        }
      } catch {
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
