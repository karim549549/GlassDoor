"use client";

import React, { useState } from "react";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccountListItem } from "./AccountListItem";
import {
  getSavedAccounts,
  removeSavedAccount,
  type SavedAccount,
} from "@/lib/client/saved-accounts";

interface AccountSwitcherProps {
  onSelectAccount: (email: string) => void;
  onUseAnother: () => void;
  onCreateAccount: () => void;
}

/**
 * Picking an account here only prefills the login form - it never restores a
 * session. The saved entry holds an email and a display name, nothing that
 * could authenticate on its own, so the password is always required.
 */
export function AccountSwitcher({
  onSelectAccount,
  onUseAnother,
  onCreateAccount,
}: AccountSwitcherProps) {
  // Lazy-initialized (not an effect) since localStorage is only available on
  // the client, and this is a "use client" component - the initializer never
  // runs during SSR.
  const [accounts, setAccounts] = useState<SavedAccount[]>(() =>
    typeof window === "undefined" ? [] : getSavedAccounts()
  );

  const handleRemove = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedAccount(email);
    setAccounts((prev) => prev.filter((acc) => acc.email !== email));
  };

  const handleAccountClick = (account: SavedAccount) => {
    onSelectAccount(account.email);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="font-display text-[2rem] leading-none mb-2 text-foreground">
          Welcome back
        </h2>
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-8">
          Select an account, then enter your password
        </p>

        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
          {accounts.map((account) => (
            <AccountListItem
              key={account.email}
              account={account}
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
