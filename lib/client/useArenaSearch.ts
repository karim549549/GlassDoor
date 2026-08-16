"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/client/logger";

/**
 * Arena search for the nav's search dialog.
 *
 * Extracted rather than inlined into NavSearch: the component's job is the
 * dialog and its keyboard behaviour, and a fetch with cancellation and three
 * display states of its own is the kind of effect logic AGENTS.md says to lift
 * into a hook.
 *
 * What this replaced matters more than what it is. The nav searched a hardcoded
 * list of five invented developers - with fabricated @devsarena.com email
 * addresses - plus six real named companies that are not customers, and three
 * links to /context, a route that does not exist. Every result was
 * simultaneously fictional and a dead link, on every page of the site, in the
 * one control users trust to tell them what a site contains.
 */

export interface ArenaSearchHit {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  format: string | null;
  isTeam: boolean;
}

interface RawArena {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  domain?: unknown;
  format?: unknown;
  isTeam?: unknown;
}

/** Settled results, tagged with the query they answer. */
interface Settled {
  key: string;
  hits: ArenaSearchHit[];
  failed: boolean;
}

const EMPTY: Settled = { key: "", hits: [], failed: false };
const NO_HITS: ArenaSearchHit[] = [];

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

export function useArenaSearch(query: string) {
  const [settled, setSettled] = useState<Settled>(EMPTY);
  const trimmed = query.trim();

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    // Aborting in cleanup is what keeps a slow early keystroke from landing
    // after a fast later one: the effect re-runs per query, so the previous
    // request is cancelled before this one starts. No ref needed.
    const controller = new AbortController();

    const params = new URLSearchParams({
      search: q,
      limit: "6",
      // Public only. The nav search is reachable logged out, and a private
      // arena's invite code exists precisely so its existence is not
      // discoverable.
      access: "public",
    });

    fetch(`/api/arena?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`arena search responded ${r.status}`);
        return r.json();
      })
      .then((data: { arenas?: RawArena[] }) => {
        const list = Array.isArray(data.arenas) ? data.arenas : [];
        setSettled({
          key: q,
          failed: false,
          hits: list.flatMap((a) => {
            const id = str(a.id);
            const title = str(a.title);
            // A row without these two cannot be linked to, so it is not a
            // result - drop it rather than render a dead entry.
            if (!id || !title) return [];
            return [
              {
                id,
                title,
                description: str(a.description),
                domain: str(a.domain),
                format: str(a.format),
                isTeam: a.isTeam === true,
              },
            ];
          }),
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        logger.error("Arena search failed", {
          query: q,
          reason: err instanceof Error ? err.message : String(err),
        });
        setSettled({ key: q, hits: NO_HITS, failed: true });
      });

    return () => controller.abort();
  }, [query]);

  // `loading` is derived, not stored: it is exactly "the settled results answer
  // a different query than the one being asked". Storing it would mean calling
  // setState synchronously inside the effect on every keystroke, which is both
  // an extra render and the cascading-render pattern the lint rule forbids.
  const answered = settled.key === trimmed;

  return {
    hits: trimmed && answered ? settled.hits : NO_HITS,
    failed: trimmed !== "" && answered && settled.failed,
    loading: trimmed !== "" && !answered,
  };
}
