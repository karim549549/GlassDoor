"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Trophy, Filter } from "lucide-react";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { CairoBillboard } from "@/components/contest/CairoBillboard";
import { UpcomingArenaBanner } from "@/components/contest/UpcomingArenaBanner";
import { ContestTabs } from "@/components/contest/ContestTabs";
import { ContestCard } from "@/components/contest/ContestCard";

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
}

export function ContestsListClient({ initialContests }: ContestsListClientProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Paginated registry items

  // 1. Identify today's active upcoming registered contest
  const upcomingContest = useMemo(() => {
    // If logged in, find the first active/upcoming contest they registered in
    if (user?.id) {
      const registered = initialContests.find((c) => 
        (c.status === "IMPLEMENTATION_PHASE" || c.status === "IDEA_PHASE" || c.status === "REGISTRATION_OPEN") &&
        c.teams.some((team) => team.members.some((m) => m.userId === user.id))
      );
      if (registered) return registered;
    }

    // Otherwise, return the first active/live contest
    return initialContests.find(
      (c) => c.status === "IMPLEMENTATION_PHASE" || c.status === "IDEA_PHASE"
    ) || null;
  }, [initialContests, user]);

  // 2. Filter Contests based on Active Tab
  const tabContests = useMemo(() => {
    if (activeTab === "my") {
      if (!user?.id) return [];
      return initialContests.filter(
        (c) =>
          c.creatorId === user.id ||
          c.teams.some((team) => team.members.some((m) => m.userId === user.id))
      );
    }
    return initialContests;
  }, [initialContests, activeTab, user]);

  // 3. Apply Search Filter
  const filteredContests = useMemo(() => {
    if (!searchQuery.trim()) return tabContests;
    const query = searchQuery.toLowerCase();
    return tabContests.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.rulesText.toLowerCase().includes(query)
    );
  }, [tabContests, searchQuery]);

  // 4. Paginate Registry
  const totalPages = Math.ceil(filteredContests.length / itemsPerPage);
  const paginatedContests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContests.slice(start, start + itemsPerPage);
  }, [filteredContests, currentPage]);

  // 5. Billboard Contests (Simulated participant counts based on squads size or static mock counts)
  const billboardContests = useMemo(() => {
    return initialContests.map((c, idx) => ({
      id: c.id,
      title: c.title,
      isPrivate: c.isPrivate,
      status: c.status,
      // Fallback participant count calculation
      participantCount: (c.teams.length * 3) + (idx * 4) + 12
    })).sort((a, b) => b.participantCount - a.participantCount);
  }, [initialContests]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      {/* 1. Normalized Dark Masthead Header with Breadcrumbs */}
      <div className="w-full bg-[#0E0E0D] text-[#F1EFE9] border-b-4 border-double border-[#F1EFE9]/25 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
        {/* Faint blueprint grid overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="masthead-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#masthead-grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <span className="font-mono text-[0.55rem] text-orange tracking-widest font-bold block uppercase">
            Home &gt; History &gt; Arena
          </span>
          <div className="overflow-hidden py-1">
            <h1 className="font-display italic text-4xl md:text-5xl uppercase tracking-tight text-[#F1EFE9]">
              Devs Arena
            </h1>
          </div>
          <p className="font-mono text-[0.52rem] text-[#F1EFE9]/60 uppercase tracking-widest leading-relaxed max-w-2xl">
            Cairo Directory Issue 002 · Egypt's active challenges, engineering cohorts, and database replication sprints.
          </p>
        </div>
      </div>

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

        <div className="relative z-10 max-w-7xl mx-auto px-4 space-y-8">
          {/* Two Column Layout: Billboard Left, Registry Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Filters, Search, and Billboard (Width 4/12) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 z-10">
              
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

                <div className="pt-2">
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

            {/* Right Column: Registry Listing Grid (Width 8/12) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Tab Contents */}
              {activeTab === "my" && !user?.id ? (
                <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-white p-10 text-center space-y-3 shadow-[4px_4px_0px_0px_#0E0E0D]">
                  <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 stroke-[1.25]" />
                  <h4 className="font-mono text-xs uppercase tracking-widest font-bold">Authentication Required</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Sign in to view and track your registered arenas, created hackathons, and live team lobbies.
                  </p>
                </div>
              ) : paginatedContests.length > 0 ? (
                <div className="space-y-6">
                  {/* Grid System for Listings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedContests.map((contest) => (
                      <ContestCard key={contest.id} contest={contest} />
                    ))}
                  </div>

                  {/* Registry Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#0E0E0D]/20 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground mt-4">
                      <span>Page {currentPage} of {totalPages} results</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-white text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
                        >
                          [PREV]
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
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
  );
}

export default ContestsListClient;
