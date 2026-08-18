"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/client/logger";

/**
 * Site-wide search for the command dialog.
 *
 * Replaces `useArenaSearch`, which called `/api/arena?search=` and therefore
 * pulled the board's full list payload - every column a row renders - to draw
 * results that show a title and one line. It could also only ever find arenas,
 * so the control people use to ask "what is on this site" could not find a
 * person. One request to `/api/search` returns grouped hits instead.
 *
 * `loading` is derived rather than stored. Storing it means a `setState` inside
 * the effect that starts the request, which schedules an extra render pass on
 * every keystroke - the same bug this file already had once.
 */

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  imageUrl?: string | null;
}

export interface SearchGroup {
  key: string;
  label: string;
  hits: SearchHit[];
}

interface Settled {
  /** The query these results answer, so a stale response cannot be shown. */
  key: string;
  groups: SearchGroup[];
  failed: boolean;
}

export function useSiteSearch(query: string) {
  const trimmed = query.trim();
  const [settled, setSettled] = useState<Settled>({ key: "", groups: [], failed: false });

  const tooShort = trimmed.length < 2;

  useEffect(() => {
    // No setState for the short-query case: writing EMPTY here is a setState
    // inside an effect, which schedules a second render on every keystroke
    // under the length threshold. The results below are derived from
    // `tooShort` instead, so there is nothing to write.
    if (tooShort) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        setSettled({ key: trimmed, groups: data.groups ?? [], failed: false });
      } catch (err) {
        if (controller.signal.aborted) return;
        logger.error("Site search failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        setSettled({ key: trimmed, groups: [], failed: true });
      }
    })();

    return () => controller.abort();
  }, [trimmed, tooShort]);

  const answered = !tooShort && settled.key === trimmed;

  return {
    groups: answered ? settled.groups : [],
    /** True while the current query has no answer yet. */
    loading: !tooShort && !answered,
    failed: answered && settled.failed,
    /** Flat order, for arrow-key navigation across group boundaries. */
    flat: answered ? settled.groups.flatMap((g) => g.hits) : [],
  };
}
