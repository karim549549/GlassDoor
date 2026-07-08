"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Trophy, Filter } from "lucide-react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { CairoBillboard } from "@/components/contest/CairoBillboard";
import { UpcomingArenaBanner } from "@/components/contest/UpcomingArenaBanner";
import { ContestTabs } from "@/components/contest/ContestTabs";
import { ContestCard, ContestCardSkeleton } from "@/components/contest/ContestCard";
import { ContestHeader } from "@/components/contest/ContestHeader";

interface ClientContest {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  status: string;
  isPrivate: boolean;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxParticipants?: number | null;
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  implPhaseStart: string;
  implPhaseEnd: string;
  requireGithubUrl: boolean;
  requireFigmaUrl: boolean;
  requireVideoUrl: boolean;
  requireWriteup: boolean;
  rulesText: string;
  creatorId: string;
  teams: {
    id: string;
    members: {
      userId: string;
    }[];
  }[];
}

interface ContestsListClientProps {
  initialContests: ClientContest[];
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
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "active" | "completed">("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "public" | "private">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "teams">("newest");

  // Dynamic state loaded via HTTP calls
  const [contests, setContests] = useState<ClientContest[]>(initialContests);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Sync API state updates when search queries or filters alter
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    const fetcher = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "50",
          status: statusFilter,
          access: accessFilter,
          search: searchQuery,
          sortBy: sortBy,
          tab: activeTab
        });

        const res = await fetch(`/api/contest?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          setContests(data.contests);
          setTotalPages(data.totalPages);
          setTotalCount(data.total);
        }
      } catch (err) {
        console.error("API fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250); // debounce API calls for search query entries

    return () => clearTimeout(fetcher);
  }, [currentPage, statusFilter, accessFilter, searchQuery, sortBy, activeTab, isFirstLoad]);

  // Reset page pagination back to 1 when filters alter
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, accessFilter, searchQuery, sortBy, activeTab]);

  // Identify today's active upcoming registered contest
  const upcomingContest = useMemo(() => {
    if (user?.id) {
      const registered = contests.find((c) => 
        (c.status === "IMPLEMENTATION_PHASE" || c.status === "IDEA_PHASE" || c.status === "REGISTRATION_OPEN") &&
        c.teams.some((team) => team.members.some((m) => m.userId === user.id))
      );
      if (registered) return registered;
    }

    return contests.find(
      (c) => c.status === "IMPLEMENTATION_PHASE" || c.status === "IDEA_PHASE"
    ) || null;
  }, [contests, user]);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="absolute inset-0 opacity-[0.085] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
          </svg>
        </div>

        <div className="relative z-10 w-[92%] xl:w-[80%] max-w-[1700px] mx-auto px-4 space-y-8">
          {/* Two Column Layout: Billboard Left (Width 3/12), Registry Right (Width 9/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Filters, Search, and Billboard (Width 3/12 on large screens) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6 z-10">
              
              {/* Neo-brutalist Search Box & Filter Controls */}
              <div className="border-2 border-[#0E0E0D] bg-white p-5 shadow-[4px_4px_0px_0px_#0E0E0D] space-y-4">
                <span className="font-mono text-[0.48rem] text-orange uppercase tracking-[0.25em] font-bold block">
                  [DIRECTORY SEARCH & FILTERS]
                </span>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Arena..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // reset to page 1
                    }}
                    className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] pl-9 pr-3 py-2 font-mono text-[0.62rem] placeholder-muted-foreground/60 uppercase focus:outline-none focus:border-orange transition-colors"
                  />
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#0E0E0D]/60" />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-[#0E0E0D]/10">
                  <span className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Scope</span>
                  <ContestTabs
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                      setActiveTab(tab);
                      setCurrentPage(1); // reset to page 1
                    }}
                    allCount={initialContests.length}
                    myCount={
                      user?.id
                        ? initialContests.filter(
                            (c) =>
                              c.creatorId === user.id ||
                              c.teams.some((team) => team.members.some((m) => m.userId === user.id))
                          ).length
                        : 0
                    }
                  />
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
                  <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="open">REGISTRATION OPEN</option>
                    <option value="active">ACTIVE STAGES</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>

                {/* Access Filter */}
                <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
                  <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Access</label>
                  <select
                    value={accessFilter}
                    onChange={(e) => {
                      setAccessFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
                  >
                    <option value="all">ALL ACCESS</option>
                    <option value="public">PUBLIC ONLY</option>
                    <option value="private">INVITE ONLY</option>
                  </select>
                </div>

                {/* Sorting Select Dropdown */}
                <div className="flex flex-col gap-1 pt-2 border-t border-dashed border-[#0E0E0D]/10">
                  <label className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-wider block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] px-2 py-1.5 font-mono text-[0.6rem] uppercase focus:outline-none focus:border-orange cursor-pointer"
                  >
                    <option value="newest">NEWEST ADDED</option>
                    <option value="oldest">OLDEST ADDED</option>
                    <option value="title">ALPHABETICAL (A-Z)</option>
                    <option value="teams">MOST TEAMS REGISTERED</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-dashed border-[#0E0E0D]/10">
                  <Link
                    href="/contest/create"
                    className="w-full py-2.5 bg-orange text-white border-2 border-[#0E0E0D] font-mono text-[0.58rem] font-bold tracking-widest uppercase hover:bg-transparent hover:text-[#0E0E0D] transition-all duration-150 shadow-[2px_2px_0px_0px_#0E0E0D] hover:shadow-none active:translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3 w-3" /> Host Arena
                  </Link>
                </div>
              </div>

              {/* CairoBillboard Rankings */}
              <CairoBillboard contests={billboardContests} />
            </div>

            {/* Right Column: Registry Listing Grid (Width 9/12 on large screens) */}
            <div className="lg:col-span-9 space-y-6 relative">
              
              {/* Registry Toolbar Header (Results & Top-Right Pagination) */}
              <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-3.5">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground font-bold">
                  Registry: {totalCount} Arena(s) Found
                </span>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className="px-2.5 py-1 border border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors text-[0.52rem] font-mono font-bold"
                      >
                        PREV
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                        className="px-2.5 py-1 border border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors text-[0.52rem] font-mono font-bold"
                      >
                        NEXT
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Tab Contents */}
              <div>
                {activeTab === "my" && !user?.id ? (
                  <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-white p-10 text-center space-y-3 shadow-[4px_4px_0px_0px_#0E0E0D]">
                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 stroke-[1.25]" />
                    <h4 className="font-mono text-xs uppercase tracking-widest font-bold">Authentication Required</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Sign in to view and track your registered arenas, created hackathons, and live team lobbies.
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-6">
                    {/* Pulsing Skeleton Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <ContestCardSkeleton key={idx} />
                      ))}
                    </div>
                  </div>
                ) : contests.length > 0 ? (
                  <div className="space-y-6">
                    {/* Grid System for Listings: 3 Columns on largest screens (xl) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {contests.map((contest) => (
                        <ContestCard key={contest.id} contest={contest} />
                      ))}
                    </div>

                    {/* Registry Pagination (Bottom Backup) */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#0E0E0D]/20 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground mt-4">
                        <span>Page {currentPage} of {totalPages} results</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
                          >
                            [PREV]
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
                          >
                            [NEXT]
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-white p-12 text-center space-y-2 shadow-[4px_4px_0px_0px_#0E0E0D]">
                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground/30 stroke-[1.25]" />
                    <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted-foreground font-bold">
                      No matching arenas found in this directory.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestsListClient;
