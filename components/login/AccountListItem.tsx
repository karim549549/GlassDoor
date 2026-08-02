import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import type { SavedAccount } from "@/lib/client/saved-accounts";

interface AccountListItemProps {
  account: SavedAccount;
  isLoading: boolean;
  onSelect: (account: SavedAccount) => void;
  onRemove: (email: string, e: React.MouseEvent) => void;
}

function AccountListItemImpl({ account, isLoading, onSelect, onRemove }: AccountListItemProps) {
  const initials = account.name
    ? account.name.slice(0, 2).toUpperCase()
    : account.email.slice(0, 2).toUpperCase();

  return (
    <div
      onClick={() => !isLoading && onSelect(account)}
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
        onClick={(e) => onRemove(account.email, e)}
        disabled={isLoading}
        className="p-2 text-muted-foreground hover:text-accent cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove account"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export const AccountListItem = React.memo(AccountListItemImpl);
export default AccountListItem;
