"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Trash2, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SavedAccount {
  email: string;
  name: string;
  refreshToken?: string | null;
}

interface AccountSwitcherProps {
  onSelectAccount: (email: string) => void;
  onUseAnother: () => void;
  onCreateAccount: () => void;
}

export function AccountSwitcher({
  onSelectAccount,
  onUseAnother,
  onCreateAccount,
}: AccountSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const { setAuth } = useAuthStore();

  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("devs_arena_saved_users");
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved accounts", e);
    }
  }, []);

  const handleRemove = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = accounts.filter((acc) => acc.email !== email);
    setAccounts(updated);
    try {
      localStorage.setItem("devs_arena_saved_users", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save accounts update", err);
    }
  };

  const handleAccountClick = async (account: SavedAccount) => {
    if (!account.refreshToken) {
      // Fallback: prompt for credentials if token is missing
      onSelectAccount(account.email);
      return;
    }

    setLoadingEmail(account.email);
    setError(null);

    try {
      const response = await fetch("/api/auth/login-saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: account.refreshToken }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update user state and store new refresh token (if rotated)
        try {
          const stored = localStorage.getItem("devs_arena_saved_users");
          let storedAccounts: SavedAccount[] = stored ? JSON.parse(stored) : [];
          const index = storedAccounts.findIndex(acc => acc.email === account.email);
          if (index > -1 && result.session?.refreshToken) {
            storedAccounts[index].refreshToken = result.session.refreshToken;
            localStorage.setItem("devs_arena_saved_users", JSON.stringify(storedAccounts));
          }
        } catch (e) {
          console.error("Failed to update rotated token", e);
        }

        // Fetch user state to fetch active roles
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setAuth(meData.user, meData.roles);
        } else {
          setAuth(result.user, ["USER"]);
        }

        const targetUrl = redirectTo || `/user/${meData.user?.id || result.user?.id}`;
        window.location.href = targetUrl;
      } else {
        // Token expired/invalid -> fallback to credentials form
        onSelectAccount(account.email);
      }
    } catch (err) {
      console.error("Auto-login error:", err);
      // Network error -> fallback to credentials form
      onSelectAccount(account.email);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="font-display text-[2rem] leading-none mb-2 text-foreground">
          Welcome back
        </h2>
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-8">
          Select an account to log in
        </p>

        {error && (
          <div className="mb-4 p-2 bg-destructive/10 border border-destructive/20 text-accent font-mono text-[0.6rem] uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
          {accounts.map((account) => {
            const initials = account.name
              ? account.name.slice(0, 2).toUpperCase()
              : account.email.slice(0, 2).toUpperCase();
            const isLoading = loadingEmail === account.email;

            return (
              <div
                key={account.email}
                onClick={() => !isLoading && handleAccountClick(account)}
                className={`group flex items-center justify-between p-4 border border-border/80 bg-card hover:border-foreground transition-all duration-150 relative ${
                  isLoading ? "cursor-wait opacity-80" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 flex items-center justify-center bg-foreground text-background font-mono text-[0.75rem] font-bold">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-background" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[0.8rem] font-semibold text-foreground leading-tight">
                      {account.name}
                    </span>
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      {account.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemove(account.email, e)}
                  disabled={isLoading}
                  className="p-2 text-muted-foreground hover:text-accent cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          onClick={onUseAnother}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Key className="h-3.5 w-3.5" />
          Use another account
        </Button>
        
        <div className="pt-6 border-t border-border/60 text-center">
          <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider">
            Don&apos;t have an account?{" "}
            <button
              onClick={onCreateAccount}
              className="text-foreground hover:underline transition-all duration-150 font-bold bg-transparent border-none cursor-pointer p-0"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountSwitcher;
