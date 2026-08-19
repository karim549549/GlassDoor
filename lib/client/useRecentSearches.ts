"use client";

import { useState } from "react";

/**
 * `storageKey` namespaces the history. The nav dialog and the invite picker
 * both search, but they search for different things - arena titles in an
 * invite box would be noise, and a person's name is not what you meant when
 * you last used Cmd+K.
 */
export function useRecentSearches(storageKey = "recent_searches") {
  const [searches, setSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(storageKey);
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
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const clearSearches = () => {
    setSearches([]);
    localStorage.removeItem(storageKey);
  };

  return { searches, addSearch, clearSearches };
}
