"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { CairoBillboard } from "@/components/contest/CairoBillboard";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { ContestContainer } from "@/components/contest/ContestContainer";
import { ContestsFilterSidebar } from "@/components/contest/list/ContestsFilterSidebar";
import { ContestsRegistry } from "@/components/contest/list/ContestsRegistry";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import type { SerializedContestListItem } from "@/lib/contest/types";
import type { ContestStatusFilter, ContestAccessFilter, ContestSortOption } from "@/lib/contest/schema";

interface ContestsListClientProps {
  initialContests: SerializedContestListItem[];
  initialTotalPages: number;
  initialTotalCount: number;
}

export function ContestsListClient({
  initialContests,
  initialTotalPages,
  initialTotalCount
}: ContestsListClientProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<ContestStatusFilter>("all");
  const [accessFilter, setAccessFilter] = useState<ContestAccessFilter>("all");
  const [sortBy, setSortBy] = useState<ContestSortOption>("newest");

  // Dynamic state loaded via HTTP calls
  const [contests, setContests] = useState<SerializedContestListItem[]>(initialContests);
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

        const res = await fetch(`/api/contest?${queryParams}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setContests(data.contests);
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

  // Billboard Contests (10 items teaser ranks based on initial data count)
  const billboardContests = useMemo(() => {
    return initialContests.map((c, idx) => ({
      id: c.id,
      title: c.title,
      isPrivate: c.isPrivate,
      status: c.status,
      participantCount: (c.teams.length * 3) + (idx * 4) + 12
    })).sort((a, b) => b.participantCount - a.participantCount);
  }, [initialContests]);

  // "My Arenas" tab count — derived from the initial snapshot + current user,
  // only needs recomputing when either actually changes.
  const myCount = useMemo(() => {
    if (!user?.id) return 0;
    return initialContests.filter(
      (c) =>
        c.creatorId === user.id ||
        c.teams.some((team) => team.members.some((m) => m.userId === user.id))
    ).length;
  }, [initialContests, user]);

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

  const handleStatusChange = (status: ContestStatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAccessChange = (access: ContestAccessFilter) => {
    setAccessFilter(access);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: ContestSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      {/* 1. Reusable Dark Masthead Header */}
      <ContestHeader
        breadcrumbs="Home > History > Arena"
        title="Devs Arena"
        description="Cairo Directory Issue 002 · Egypt's active challenges, engineering cohorts, and database replication sprints."
      />

      {/* 2. Main Page Content (Sand background with blueprint lines) */}
      <div className="relative z-10 py-12 md:py-16">
        {/* Editorial Background Blueprint Grid */}
        <BackgroundGrid opacity={0.085} />

        <ContestContainer className="relative z-10 px-4 space-y-8">
          {/* Two Column Layout: Billboard Left (Width 3/12), Registry Right (Width 9/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Filters, Search, and Billboard (Width 3/12 on large screens) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6 z-10">
              <ContestsFilterSidebar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                allCount={initialContests.length}
                myCount={myCount}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                accessFilter={accessFilter}
                onAccessChange={handleAccessChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />

              {/* CairoBillboard Rankings */}
              <CairoBillboard contests={billboardContests} />
            </div>

            {/* Right Column: Registry Listing Grid (Width 9/12 on large screens) */}
            <ContestsRegistry
              contests={contests}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              activeTab={activeTab}
              isUserLoggedIn={!!user?.id}
            />

          </div>
        </ContestContainer>
      </div>
    </div>
  );
}

export default ContestsListClient;
