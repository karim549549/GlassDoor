"use client";

import { useState } from "react";

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("recent_searches");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      // Silent on purpose: a corrupted or stale-format localStorage value
      // (e.g. left over from an older schema) is expected, not a bug -
      // falls back to an empty recent-searches list, nothing to fail over.
      return [];
    }
  });

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
