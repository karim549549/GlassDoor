"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccountListItem } from "./AccountListItem";
import {
  getSavedAccounts,
  removeSavedAccount,
  upsertSavedAccount,
  type SavedAccount,
} from "@/lib/client/saved-accounts";
import { logger } from "@/lib/client/logger";

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

  // Lazy-initialized (not an effect) since localStorage is only available on
  // the client, and this is a "use client" component - the initializer never
  // runs during SSR.
  const [accounts, setAccounts] = useState<SavedAccount[]>(() =>
    typeof window === "undefined" ? [] : getSavedAccounts()
  );
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedAccount(email);
    setAccounts((prev) => prev.filter((acc) => acc.email !== email));
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
        // Store the rotated refresh token, if Supabase issued a new one
        if (result.session?.refreshToken) {
          upsertSavedAccount({
            email: account.email,
            name: account.name,
            refreshToken: result.session.refreshToken,
          });
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
        router.push(targetUrl);
        router.refresh();
      } else {
        // Token expired/invalid -> fallback to credentials form
        onSelectAccount(account.email);
      }
    } catch (err) {
      logger.error("Auto-login error", { error: err instanceof Error ? err.message : String(err) });
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
          {accounts.map((account) => (
            <AccountListItem
              key={account.email}
              account={account}
              isLoading={loadingEmail === account.email}
              onSelect={handleAccountClick}
              onRemove={handleRemove}
            />
          ))}
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
