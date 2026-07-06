"use client";

import React, { useEffect, useState } from "react";
import { User, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SavedAccount {
  email: string;
  name: string;
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
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sherh_saved_users");
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
      localStorage.setItem("sherh_saved_users", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save accounts update", err);
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

        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
          {accounts.map((account) => {
            const initials = account.name
              ? account.name.slice(0, 2).toUpperCase()
              : account.email.slice(0, 2).toUpperCase();

            return (
              <div
                key={account.email}
                onClick={() => onSelectAccount(account.email)}
                className="group flex items-center justify-between p-4 border border-border/80 bg-card hover:border-foreground cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 flex items-center justify-center bg-foreground text-background font-mono text-[0.75rem] font-bold">
                    {initials}
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
                  className="p-2 text-muted-foreground hover:text-accent cursor-pointer transition-colors"
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
