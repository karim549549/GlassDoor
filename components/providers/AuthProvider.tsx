"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAuth(data.user, data.roles);
          // Sync session details to local storage saved accounts
          try {
            const stored = localStorage.getItem("sherh_saved_users");
            let accounts = stored ? JSON.parse(stored) : [];
            const email = data.user.email;
            const index = accounts.findIndex(
              (acc: any) => acc.email.toLowerCase() === email.toLowerCase()
            );

            const accountData = {
              email: email,
              name: data.user.fullName || email.split("@")[0],
              refreshToken: data.session?.refreshToken || null,
            };

            if (index > -1) {
              if (accounts[index].refreshToken !== accountData.refreshToken) {
                accounts[index] = { ...accounts[index], ...accountData };
                localStorage.setItem("sherh_saved_users", JSON.stringify(accounts));
              }
            } else {
              accounts.push(accountData);
              localStorage.setItem("sherh_saved_users", JSON.stringify(accounts));
            }
          } catch (e) {
            console.error("Local account session sync failed", e);
          }
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
