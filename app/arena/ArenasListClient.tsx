"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { logger } from "@/lib/client/logger";
import { CairoBillboard } from "@/components/arena/CairoBillboard";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenasFilterSidebar } from "@/components/arena/list/ArenasFilterSidebar";
import { ArenasRegistry } from "@/components/arena/list/ArenasRegistry";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import type { SerializedArenaListItem } from "@/lib/arena/types";
import { deriveArenaStatus } from "@/lib/arena/status";
import type { ArenaStatusFilter, ArenaAccessFilter, ArenaSortOption } from "@/lib/arena/schema";

interface ArenasListClientProps {
  initialArenas: SerializedArenaListItem[];
  initialTotalPages: number;
  initialTotalCount: number;
  initialMyCount: number | null;
}

export function ArenasListClient({
  initialArenas,
  initialTotalPages,
  initialTotalCount,
  initialMyCount
}: ArenasListClientProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<ArenaStatusFilter>("all");
  const [accessFilter, setAccessFilter] = useState<ArenaAccessFilter>("all");
  const [sortBy, setSortBy] = useState<ArenaSortOption>("newest");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Dynamic state loaded via HTTP calls
  const [arenas, setArenas] = useState<SerializedArenaListItem[]>(initialArenas);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [myCount, setMyCount] = useState<number | null>(initialMyCount);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Bumped by the retry button. The filter values are unchanged on a retry, so
  // without a dedicated dep the effect would not re-run.
  const [retryNonce, setRetryNonce] = useState(0);

  // app/arena/page.tsx already server-rendered page 1 with exactly these
  // defaults, so the first run of the effect below would re-request identical
  // data - two full list queries on every visit. Skip it and let the effect
  // take over from the first real filter change onward.
  const isInitialRender = useRef(true);

  // Only the free-text search needs debouncing; the other filters are
  // discrete/select-driven and can trigger a fetch immediately.
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  // Sync API state updates when search queries or filters alter
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Aborts the in-flight request rather than just ignoring its result, so a
    // fast sequence of filter changes does not leave stale requests running.
    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "50",
          status: statusFilter,
          access: accessFilter,
          search: debouncedSearch,
          sortBy: sortBy,
          tab: activeTab,
          ...(selectedTag ? { tag: selectedTag } : {}),
        });

        const res = await fetch(`/api/arena?${queryParams}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setArenas(data.arenas);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
        setMyCount(data.myCount ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        logger.error("Arena list fetch failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        // Surface it - the previous version logged and left stale results on
        // screen, so a failed filter looked like a filter that matched nothing.
        setLoadError("Could not load arenas. Check your connection and try again.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [currentPage, statusFilter, accessFilter, debouncedSearch, sortBy, activeTab, selectedTag, retryNonce]);

  // Ranks the arenas currently on screen. Previously built from initialArenas,
  // so it kept describing page 1 after the user filtered or paginated away.
  const billboardArenas = useMemo(() => {
    const now = new Date();
    return arenas
      .map((a, idx) => {
        const derived = deriveArenaStatus(
          {
            registrationStart: new Date(a.registrationStart),
            registrationEnd: new Date(a.registrationEnd),
            ideaPhaseStart: new Date(a.ideaPhaseStart),
            ideaPhaseEnd: new Date(a.ideaPhaseEnd),
            implPhaseStart: new Date(a.implPhaseStart),
            implPhaseEnd: new Date(a.implPhaseEnd),
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
            canceledAt: a.canceledAt ? new Date(a.canceledAt) : null,
            resultsPublishedAt: a.resultsPublishedAt ? new Date(a.resultsPublishedAt) : null,
          },
          now
        );
        const participantCount = a.isTeam
          ? a.teams.length * 3 + idx * 4 + 12
          : a.entries?.filter((e) => !e.withdrawnAt).length || idx * 4 + 12;

        return {
          id: a.id,
          title: a.title,
          isPrivate: a.isPrivate,
          status: derived,
          participantCount,
        };
      })
      .sort((a, b) => b.participantCount - a.participantCount);
  }, [arenas]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "all" | "my") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: ArenaStatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAccessChange = (access: ArenaAccessFilter) => {
    setAccessFilter(access);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: ArenaSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleTagChange = (tagSlug: string) => {
    setSelectedTag(tagSlug);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      {/* 1. Reusable Dark Masthead Header */}
      <ArenaHeader
        breadcrumbs="Home > History > Arena"
        title="Devs Arena"
        description="Cairo Directory Issue 002 · Egypt's active challenges, engineering cohorts, and database replication sprints."
      />

      {/* 2. Main Page Content (Sand background with blueprint lines) */}
      <div className="relative z-10 py-12 md:py-16">
        {/* Editorial Background Blueprint Grid */}
        <BackgroundGrid opacity={0.085} />

        <ArenaContainer className="relative z-10 px-4 space-y-8">
          {/* Two Column Layout: Billboard Left (Width 3/12), Registry Right (Width 9/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Filters, Search, and Billboard (Width 3/12 on large screens) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6 z-10">
              <ArenasFilterSidebar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                allCount={totalCount}
                myCount={myCount ?? 0}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                accessFilter={accessFilter}
                onAccessChange={handleAccessChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                selectedTag={selectedTag}
                onTagChange={handleTagChange}
              />

              {/* CairoBillboard Rankings */}
              <CairoBillboard arenas={billboardArenas} />
            </div>

            {/* Right Column: Registry Listing Grid (Width 9/12 on large screens) */}
            <div className="lg:col-span-9 space-y-4">
              {loadError && (
                <div
                  role="alert"
                  className="border-2 border-destructive bg-card p-4 flex items-center justify-between gap-4"
                >
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-destructive font-bold">
                    [Error] {loadError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryNonce((n) => n + 1)}
                    className="px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono text-[0.55rem] font-bold tracking-wider uppercase hover:bg-orange transition-colors shrink-0"
                  >
                    [Retry]
                  </button>
                </div>
              )}

              <ArenasRegistry
              arenas={arenas}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
                activeTab={activeTab}
                isUserLoggedIn={!!user?.id}
              />
            </div>

          </div>
        </ArenaContainer>
      </div>
    </div>
  );
}

export default ArenasListClient;
