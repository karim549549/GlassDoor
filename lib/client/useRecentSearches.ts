"use client";

import { useState, useEffect } from "react";

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const clearSearches = () => {
    setSearches([]);
    localStorage.removeItem("recent_searches");
  };

  return { searches, addSearch, clearSearches };
}
