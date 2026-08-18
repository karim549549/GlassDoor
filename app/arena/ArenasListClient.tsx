"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { logger } from "@/lib/client/logger";
import { ArenaRow, ArenaRowSkeleton } from "@/components/arena/list/ArenaRow";
import {
  ArenaFilterBar,
  BoardToolbar,
  type ArenaFilterState,
} from "@/components/arena/list/ArenaFilterBar";
import { ArenasFooterPagination } from "@/components/arena/list/ArenasPagination";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { PageMasthead } from "@/components/site/PageMasthead";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { BoardFacets, type BoardFacetData } from "@/components/arena/list/BoardFacets";
import { BoardSidebar, type BoardSidebarData } from "@/components/arena/list/BoardSidebar";
import type { SerializedArenaListItem } from "@/lib/arena/types";

/**
 * The board.
 *
 * Rows rather than cards, a status rail rather than a sidebar `<select>`, and
 * filters on the axes a reader actually decides by. See ArenaRow and
 * ArenaFilterBar for what each replaced and why.
 *
 * One clock for the whole list. Every row needs "closes in 2d 4h", and a row
 * reading `Date.now()` for itself would render one value in the server's HTML
 * and another on the browser's first paint - fifty simultaneous hydration
 * mismatches. `now` is state here, seeded from the server's timestamp so the
 * first client render matches byte for byte, then advanced once a minute.
 */

const DEFAULTS: ArenaFilterState = {
  status: "all",
  place: [],
  entry: [],
  difficulty: [],
  prized: false,
  sortBy: "closing",
  tab: "all",
};

interface ArenasListClientProps {
  initialArenas: SerializedArenaListItem[];
  initialTotalPages: number;
  initialTotalCount: number;
  initialMyCount: number | null;
  /** The server's clock at render time, so the first paint agrees with the HTML. */
  nowIso: string;
  facets: BoardFacetData;
  spotlight: BoardSidebarData;
}

export function ArenasListClient({
  initialArenas,
  initialTotalPages,
  initialTotalCount,
  initialMyCount,
  nowIso,
  facets,
  spotlight,
}: ArenasListClientProps) {
  const { user } = useAuthStore();

  const [filters, setFilters] = useState<ArenaFilterState>(DEFAULTS);
  const [page, setPage] = useState(1);

  const [arenas, setArenas] = useState(initialArenas);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [myCount, setMyCount] = useState<number | null>(initialMyCount);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Minute resolution is enough: no countdown on this page is finer than "1m",
  // so a faster tick would re-render fifty rows to change nothing.
  const [now, setNow] = useState(() => new Date(nowIso));
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // app/arena/page.tsx already server-rendered page 1 with exactly these
  // defaults, so the first run of the effect below would re-request identical
  // data - two full list queries on every visit.
  const isInitialRender = useRef(true);

  const patch = useCallback((next: Partial<ArenaFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    // Any filter change invalidates the page number: page 4 of the old result
    // is very often past the end of the new one, which reads as "no arenas".
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setFilters((prev) => ({ ...DEFAULTS, tab: prev.tab }));
    setPage(1);
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("status", filters.status);
    params.set("sortBy", filters.sortBy);
    params.set("tab", filters.tab);
    // Comma-separated rather than repeated keys: readable in an address bar,
    // and omitted entirely when empty so the URL says only what was chosen.
    if (filters.place.length) params.set("place", filters.place.join(","));
    if (filters.entry.length) params.set("entry", filters.entry.join(","));
    if (filters.difficulty.length) params.set("difficulty", filters.difficulty.join(","));
    return params.toString();
  }, [page, filters]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(`/api/arena?${query}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Board request failed: ${res.status}`);
        const data = await res.json();

        setArenas(data.arenas ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalCount(data.total ?? 0);
        if (data.myCount !== undefined) setMyCount(data.myCount);
      } catch (err) {
        if (controller.signal.aborted) return;
        logger.error("Failed to load arenas", {
          error: err instanceof Error ? err.message : String(err),
        });
        setLoadError("Could not load the board.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [query, retryNonce]);

  return (
    <main id="main-content" className="relative min-h-screen bg-background text-foreground">
      {/* The same blueprint grid the homepage sits on. It reads as one site
          rather than a marketing page and a set of unrelated tools. */}
      <BackgroundGrid opacity={0.055} />

      <PageMasthead
        eyebrow="The board"
        title="Every arena you can enter, and every one you missed"
        standfirst="Somebody posts a brief with no business existing. A few teams build it against a clock. Free to enter, online or in a room in Cairo."
      />

      <ArenaContainer className="relative z-10 py-8">
        {/* Controls left, list right.

            They were stacked above the list: masthead, then stat cards, then a
            search field, then three rows of chips, then a count - so on a
            laptop the first arena sat below the fold and the page opened on
            nothing but chrome. A board whose first screen contains no rows is
            not a board.

            Everything that sets the query moves into a sticky rail, and the
            list starts at the top of its own column. Below `lg` it stacks
            again, controls first, because a rail beside a phone screen is just
            a longer page. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
          {/* No max-height, no inner scrollbar, and deliberately not sticky.

              A sticky element taller than the viewport traps its own bottom:
              it pins at the top and the last panel becomes unreachable, so
              the fix for that was an inner scroll area - a second scrollbar
              beside the page's own, which is worse than the problem. The rail
              takes the height it needs and scrolls with the document, which
              is what a column of content should do. */}
          <aside className="flex flex-col gap-6">
            <BoardFacets
              facets={facets}
              now={now}
              activeStatus={filters.status}
              onStatus={(status) => patch({ status })}
            />

            <ArenaFilterBar
              value={filters}
              onChange={patch}
              onReset={reset}
              myCount={user ? myCount : null}
            />

            <BoardSidebar data={spotlight} now={now} />
          </aside>

          <div className="min-w-0">
            <BoardToolbar
              total={totalCount}
              sortBy={filters.sortBy}
              onSort={(sortBy) => patch({ sortBy })}
            />

            <div className="border border-foreground/15 bg-card">
              {loadError ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent">
                    {loadError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryNonce((n) => n + 1)}
                    className="border-2 border-foreground px-4 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    Try again
                  </button>
                </div>
              ) : isLoading && arenas.length === 0 ? (
                // Only on a genuinely empty load. When rows are already on
                // screen they stay and dim, because replacing real content with
                // grey bars is a downgrade, not a loading state.
                <ul>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ArenaRowSkeleton key={i} />
                  ))}
                </ul>
              ) : arenas.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                  <p className="font-display text-lg italic text-foreground">Nothing here</p>
                  <p className="max-w-sm font-sans text-sm text-foreground/65">
                    No arena matches that. Widen the filters, or write the brief
                    you were looking for.
                  </p>
                  <Link
                    href="/arena/create"
                    className="mt-1 border-2 border-orange bg-orange px-4 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5"
                  >
                    Write a brief
                  </Link>
                </div>
              ) : (
                <ul className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                  {arenas.map((arena) => (
                    <ArenaRow
                      key={arena.id}
                      arena={arena}
                      now={now}
                      viewerId={user?.id ?? null}
                    />
                  ))}
                </ul>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <ArenasFooterPagination
                  currentPage={page}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </ArenaContainer>
    </main>
  );
}

export default ArenasListClient;
