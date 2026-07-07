"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRecentSearches } from "@/lib/client/useRecentSearches";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";

// Mock data as requested (no backend yet)
const MOCK_USERS = [
  { id: "usr1", name: "Anwar Moustafa", handle: "anwar_m", email: "anwar@devsarena.com" },
  { id: "usr2", name: "Karim Hassan", handle: "karim_h", email: "karim@devsarena.com" },
  { id: "usr3", name: "Moustafa Ali", handle: "moustafa_a", email: "moustafa@devsarena.com" },
  { id: "usr4", name: "Salma Mahmoud", handle: "salma_m", email: "salma@devsarena.com" },
  { id: "usr5", name: "Hassan Ibrahim", handle: "hassan_i", email: "hassan@devsarena.com" },
];

const MOCK_COMPANIES = [
  { id: 1, name: "Vodafone Egypt", sector: "Telecom" },
  { id: 2, name: "Raya Contact", sector: "BPO / Tech" },
  { id: 3, name: "Instabug", sector: "Product / SaaS" },
  { id: 4, name: "Amazon Egypt", sector: "Big Tech" },
  { id: 5, name: "Paymob", sector: "Fintech" },
  { id: 6, name: "Swvl", sector: "Transport Tech" },
];

const MOCK_CONTEXT = [
  { id: "rules", title: "Community Guidelines & Rules", description: "Rules profile and salary sharing policies.", url: "/context" },
  { id: "spec", title: "Salary Dataset Specifications", description: "Learn about calculations and verification.", url: "/context" },
  { id: "privacy", title: "Anonymity & Privacy Policy", description: "How we protect developer identity.", url: "/context" },
];

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

  // Populate from URL on mount/open
  useEffect(() => {
    if (isOpen) {
      const searchUrl = searchParams.get("search") || "";
      setQuery(searchUrl);
    }
  }, [isOpen, searchParams]);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(open); }}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-1.5">
                <span className="font-bold text-[#0E0E0D]/60">Recent Searches</span>
                {searches.length > 0 && (
                  <button
                    onClick={clearSearches}
                    className="text-[0.55rem] text-orange hover:underline cursor-pointer border-none bg-transparent p-0"
                  >
                    Clear history
                  </button>
                )}
              </div>
              {searches.length === 0 ? (
                <div className="text-[0.6rem] text-muted-foreground/60 italic lowercase normal-case py-1">
                  No recent searches.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {searches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentClick(term)}
                      className="px-2 py-1 bg-[#FAF8F5] border border-[#0E0E0D] text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors cursor-pointer text-[0.58rem]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Search Results Categories */}
          {query.trim() && (
            <div className="space-y-4">
              {/* Category: People */}
              {matchedUsers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#0E0E0D]/60 border-b border-[#0E0E0D]/10 pb-1">
                    People / Users ({matchedUsers.length})
                  </div>
                  <div className="divide-y divide-[#0E0E0D]/5">
                    {matchedUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleResultClick(`/user/${u.id}`)}
                        className="py-2 px-2 hover:bg-[#0E0E0D]/5 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0E0E0D]">{u.name}</span>
                          <span className="text-[0.58rem] text-orange lowercase">@{u.handle}</span>
                        </div>
                        <span className="text-[0.55rem] opacity-40">Profile →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Companies */}
              {matchedCompanies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#0E0E0D]/60 border-b border-[#0E0E0D]/10 pb-1">
                    Companies ({matchedCompanies.length})
                  </div>
                  <div className="divide-y divide-[#0E0E0D]/5">
                    {matchedCompanies.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleResultClick(`/companies/${c.id}`)}
                        className="py-2 px-2 hover:bg-[#0E0E0D]/5 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0E0E0D]">{c.name}</span>
                          <span className="text-[0.58rem] text-muted-foreground">{c.sector}</span>
                        </div>
                        <span className="text-[0.55rem] opacity-40">Salaries & Reviews →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Context */}
              {matchedContext.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#0E0E0D]/60 border-b border-[#0E0E0D]/10 pb-1">
                    Context / Guides ({matchedContext.length})
                  </div>
                  <div className="divide-y divide-[#0E0E0D]/5">
                    {matchedContext.map((co) => (
                      <div
                        key={co.id}
                        onClick={() => handleResultClick(co.url)}
                        className="py-2 px-2 hover:bg-[#0E0E0D]/5 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0E0E0D]">{co.title}</span>
                          <span className="text-[0.58rem] text-muted-foreground lowercase normal-case">{co.description}</span>
                        </div>
                        <span className="text-[0.55rem] opacity-40">View →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {matchedUsers.length === 0 && matchedCompanies.length === 0 && matchedContext.length === 0 && (
                <div className="text-center py-6 text-muted-foreground lowercase normal-case italic">
                  No matching results found for "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NavSearch;
