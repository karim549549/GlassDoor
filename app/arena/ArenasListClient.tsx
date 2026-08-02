"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { CairoBillboard } from "@/components/arena/CairoBillboard";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenasFilterSidebar } from "@/components/arena/list/ArenasFilterSidebar";
import { ArenasRegistry } from "@/components/arena/list/ArenasRegistry";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import type { SerializedArenaListItem } from "@/lib/arena/types";
import type { ArenaStatusFilter, ArenaAccessFilter, ArenaSortOption } from "@/lib/arena/schema";

interface ArenasListClientProps {
  initialArenas: SerializedArenaListItem[];
  initialTotalPages: number;
  initialTotalCount: number;
}

export function ArenasListClient({
  initialArenas,
  initialTotalPages,
  initialTotalCount
}: ArenasListClientProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<ArenaStatusFilter>("all");
  const [accessFilter, setAccessFilter] = useState<ArenaAccessFilter>("all");
  const [sortBy, setSortBy] = useState<ArenaSortOption>("newest");

  // Dynamic state loaded via HTTP calls
  const [arenas, setArenas] = useState<SerializedArenaListItem[]>(initialArenas);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstLoad = useRef(true);

  // Only the free-text search needs debouncing; the other filters are
  // discrete/select-driven and can trigger a fetch immediately.
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  // Sync API state updates when search queries or filters alter
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "50",
          status: statusFilter,
          access: accessFilter,
          search: debouncedSearch,
          sortBy: sortBy,
          tab: activeTab
        });

        const res = await fetch(`/api/arena?${queryParams}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setArenas(data.arenas);
          setTotalPages(data.totalPages);
          setTotalCount(data.total);
        }
      } catch (err) {
        console.error("API fetch error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, statusFilter, accessFilter, debouncedSearch, sortBy, activeTab]);

  // Billboard Arenas (10 items teaser ranks based on initial data count)
  const billboardArenas = useMemo(() => {
    return initialArenas.map((a, idx) => ({
      id: a.id,
      title: a.title,
      isPrivate: a.isPrivate,
      status: a.status,
      participantCount: (a.teams.length * 3) + (idx * 4) + 12
    })).sort((a, b) => b.participantCount - a.participantCount);
  }, [initialArenas]);

  // "My Arenas" tab count — derived from the initial snapshot + current user
  const myCount = useMemo(() => {
    if (!user?.id) return 0;
    return initialArenas.filter(
      (a) =>
        a.creatorId === user.id ||
        a.teams.some((team) => team.members.some((m) => m.userId === user.id))
    ).length;
  }, [initialArenas, user]);

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
                allCount={initialArenas.length}
                myCount={myCount}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                accessFilter={accessFilter}
                onAccessChange={handleAccessChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />

              {/* CairoBillboard Rankings */}
              <CairoBillboard arenas={billboardArenas} />
            </div>

            {/* Right Column: Registry Listing Grid (Width 9/12 on large screens) */}
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
        </ArenaContainer>
      </div>
    </div>
  );
}

export default ArenasListClient;
