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
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-12">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-14 space-y-8">
        {/* Two Column Layout: Billboard Left, Registry Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Billboard (Width 4/12) */}
          <div className="lg:col-span-4 lg:sticky lg:top-16">
            <CairoBillboard contests={billboardContests} />
          </div>

          {/* Right Column: Registry Listing (Width 8/12) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabs Navigation & Search & Create */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0E0E0D]/10 pb-2">
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

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Neo-brutalist Search Box */}
                <div className="relative max-w-xs w-full shrink-0">
                  <input
                    type="text"
                    placeholder="[Search Arena]"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // reset to page 1
                    }}
                    className="w-full bg-[#FAF8F5] border-2 border-[#0E0E0D] pl-8 pr-3 py-1.5 font-mono text-[0.62rem] placeholder-muted-foreground/60 uppercase focus:outline-none focus:border-accent shadow-[2px_2px_0px_0px_#0E0E0D] transition-colors"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#0E0E0D]/60" />
                </div>

                {/* Inline Action Button */}
                <Link
                  href="/contest/create"
                  className="px-3.5 py-1.5 bg-orange text-white border-2 border-[#0E0E0D] font-mono text-[0.58rem] font-bold tracking-wider uppercase hover:bg-[#FAF8F5] hover:text-[#0E0E0D] transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3 w-3" /> Host Arena
                </Link>
              </div>
            </div>

          {/* Active Tab Contents */}
          {activeTab === "my" && !user?.id ? (
            <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-[#FAF8F5] p-10 text-center space-y-3 shadow-[4px_4px_0px_0px_#0E0E0D]">
              <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 stroke-[1.25]" />
              <h4 className="font-mono text-xs uppercase tracking-widest font-bold">Authentication Required</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sign in to view and track your registered arenas, created hackathons, and live team lobbies.
              </p>
            </div>
          ) : paginatedContests.length > 0 ? (
            <div className="space-y-5">
              {paginatedContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}

              {/* Registry Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#0E0E0D]/20 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground mt-4">
                  <span>Page {currentPage} of {totalPages} results</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
                    >
                      [PREV]
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border-2 border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 font-bold"
                    >
                      [NEXT]
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-[#FAF8F5] p-12 text-center space-y-2 shadow-[4px_4px_0px_0px_#0E0E0D]">
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
  );
}

export default ContestsListClient;
