"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRecentSearches } from "@/lib/client/useRecentSearches";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { MOCK_USERS, MOCK_COMPANIES, MOCK_CONTEXT } from "./nav-search-mock-data";
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

  // Filter search items client-side
  const trimmed = debouncedQuery.trim().toLowerCase();

  const matchedUsers = trimmed
    ? MOCK_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(trimmed) ||
          u.handle.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchedCompanies = trimmed
    ? MOCK_COMPANIES.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.sector.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchedContext = trimmed
    ? MOCK_CONTEXT.filter(
        (co) =>
          co.title.toLowerCase().includes(trimmed) ||
          co.description.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

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
                ? "bg-[#0E0E0D] text-[#F1EFE9] border-[#F1EFE9]/20 hover:border-[#F1EFE9]"
                : "bg-[#FAF8F5] text-[#0E0E0D] border-[#0E0E0D]/25 hover:border-[#0E0E0D] shadow-[2px_2px_0px_0px_currentColor] active:translate-y-0.5 active:shadow-none"
            }`}
          >
            <span className="opacity-60">Search site...</span>
            <Search className="h-3 w-3 opacity-60" />
          </button>
        }
      />

      <DialogContent
        showCloseButton={false}
        className="w-full max-w-3xl p-0 bg-[#F1EFE9] border-2 border-[#0E0E0D] rounded-none shadow-[6px_6px_0px_0px_#0E0E0D] font-mono text-[0.65rem] uppercase tracking-wider text-[#0E0E0D] z-[100] overflow-hidden"
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-[#0E0E0D] bg-[#FAF8F5]">
          <Search className="h-4 w-4 text-[#0E0E0D]/60 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-mono text-[0.7rem] uppercase tracking-wider placeholder-[#0E0E0D]/40 text-[#0E0E0D]"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#0E0E0D]/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="h-4 w-4 text-[#0E0E0D]" />
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
              matchedUsers={matchedUsers}
              matchedCompanies={matchedCompanies}
              matchedContext={matchedContext}
              onResultClick={handleResultClick}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NavSearch;
