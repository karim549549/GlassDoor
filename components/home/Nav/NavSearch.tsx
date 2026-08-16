"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRecentSearches } from "@/lib/client/useRecentSearches";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { useArenaSearch } from "@/lib/client/useArenaSearch";
import { NavSearchRecent } from "./NavSearchRecent";
import { NavSearchResults } from "./NavSearchResults";

interface NavSearchProps {
  isDarkTheme: boolean;
}

export function NavSearch({ isDarkTheme }: NavSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { searches, addSearch, clearSearches } = useRecentSearches();

  // Sync query to URL history state
  useEffect(() => {
    if (isOpen) {
      const url = debouncedQuery
        ? `${pathname}?search=${encodeURIComponent(debouncedQuery)}`
        : pathname;
      window.history.replaceState(null, "", url);
    }
  }, [debouncedQuery, isOpen, pathname]);

  // Hits the real board. Only runs while the dialog is open - the debounced
  // query is cleared on close, so a shut dialog holds no in-flight request.
  const { hits, loading, failed } = useArenaSearch(isOpen ? debouncedQuery : "");

  const handleResultClick = (url: string) => {
    if (query.trim()) {
      addSearch(query);
    }
    setIsOpen(false);
    // Remove search param from URL when navigating away or closing
    window.history.replaceState(null, "", pathname);
    router.push(url);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState(null, "", pathname);
  };

  // Seed the input from the URL's search param at the moment the dialog opens,
  // rather than reacting to isOpen in an effect (avoids a setState-in-effect
  // cascade for what is really an open-time initialization).
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setQuery(searchParams.get("search") || "");
      setIsOpen(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            className={`w-full lg:w-80 flex items-center justify-between gap-6 px-3.5 py-1.5 font-mono text-[0.55rem] tracking-wider uppercase border transition-all duration-150 cursor-pointer ${
              isDarkTheme
                ? "bg-foreground text-background border-background/20 hover:border-background"
                : "bg-card text-foreground border-foreground/25 hover:border-foreground shadow-[2px_2px_0px_0px_currentColor] active:translate-y-0.5 active:shadow-none"
            }`}
          >
            <span className="opacity-60">Search site...</span>
            <Search className="h-3 w-3 opacity-60" />
          </button>
        }
      />

      <DialogContent
        showCloseButton={false}
        className="w-full max-w-3xl p-0 bg-background border-2 border-foreground rounded-none shadow-[6px_6px_0px_0px_var(--foreground)] font-mono text-[0.65rem] uppercase tracking-wider text-foreground z-[100] overflow-hidden"
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-foreground bg-card">
          <Search className="h-4 w-4 text-foreground/60 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            aria-label="Search site"
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-mono text-[0.7rem] uppercase tracking-wider placeholder-foreground/40 text-foreground"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-foreground/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="max-h-[350px] overflow-y-auto p-4 space-y-5">
          {/* 1. Recent Searches (shown if query is empty) */}
          {!query.trim() && (
            <NavSearchRecent searches={searches} onClear={clearSearches} onSelect={handleRecentClick} />
          )}

          {/* 2. Search Results Categories */}
          {query.trim() && (
            <NavSearchResults
              query={query}
              hits={hits}
              loading={loading}
              failed={failed}
              onResultClick={handleResultClick}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NavSearch;
