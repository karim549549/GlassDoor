"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Company } from "@/lib/companies/types";
import { ratingColorClass } from "@/lib/companies/format";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

interface SearchBoxProps {
  initialCompanies: Company[];
}

export function SearchBox({ initialCompanies }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdown] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [searchResults, setSearchResults] = useState<Company[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = query.trim();
  const companies = trimmedQuery === "" ? initialCompanies : (searchResults ?? initialCompanies);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    const requestId = ++requestIdRef.current;
    fetch(`/api/companies?q=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((results: Company[]) => {
        if (requestIdRef.current === requestId) {
          setSearchResults(results);
        }
      });
  }, [debouncedQuery]);

  function selectCompany(c: Company) {
    setDropdown(false);
    router.push(`/companies/${c.id}`);
  }

  function clearSearch() {
    setQuery("");
    setCompany(null);
    setDropdown(true);
    inputRef.current?.focus();
  }

  return (
    <>
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground mb-2 text-center">
        — search any Egyptian tech company —
      </div>

      <div className="relative">
        <div className="flex items-center border-2 border-foreground bg-card focus-within:border-accent transition-colors">
          <Search className="w-4 h-4 mx-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setDropdown(true); }}
            onFocus={() => setDropdown(true)}
            onBlur={() => setTimeout(() => setDropdown(false), 150)}
            placeholder="Vodafone, PwC, Instabug, Amazon..."
            className="flex-1 py-4 pr-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            style={{ fontSize: "clamp(0.875rem, 1.1vw, 1rem)" }}
          />
          {query && (
            <button
              onMouseDown={clearSearch}
              className="px-4 text-xl text-muted-foreground hover:text-foreground transition-colors leading-none"
            >
              ×
            </button>
          )}
        </div>

        {dropdownOpen && companies.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-card border-x-2 border-b-2 border-foreground shadow-2xl">
            {companies.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onMouseDown={() => selectCompany(c)}
                className="w-full text-left px-4 py-3 hover:bg-secondary flex items-center justify-between border-b border-border last:border-0 transition-colors text-[0.875rem]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {c.sector}
                  </span>
                </div>
                <span className={`font-mono text-[0.75rem] font-medium ${ratingColorClass(c.rating)}`}>
                  {c.rating}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>


    </>
  );
}
