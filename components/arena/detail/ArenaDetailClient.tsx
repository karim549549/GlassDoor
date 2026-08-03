"use client";

import React, { useState } from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaDetailHero } from "./ArenaDetailHero";
import { ArenaOverviewTab } from "./ArenaOverviewTab";
import { ArenaTeamPoolsTab, PrototypeTeam } from "./ArenaTeamPoolsTab";
import { ArenaSubmissionTab } from "./ArenaSubmissionTab";
import { ArenaLeaderboardTab } from "./ArenaLeaderboardTab";
import { ArenaCommentsSection } from "./ArenaCommentsSection";
import { Footer } from "@/components/home/Footer";
import { CheckCircle2, Users, Upload, Trophy } from "lucide-react";

interface ArenaDetailClientProps {
  arena: {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string | null;
    additionalImages?: string[];
    status: string;
    isPrivate: boolean;
    inviteCode?: string | null;
    isTeam: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    maxParticipants: number | null;
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
    creator: {
      id: string;
      fullName: string | null;
      handle: string;
      avatarUrl: string | null;
    };
    tags: {
      tag: {
        id: string;
        name: string;
        slug: string;
        color?: string | null;
      };
    }[];
  };
  meta: {
    isOwner: boolean;
    isRegistered: boolean;
    totalParticipants: number;
  };
}

// Initial mock team pools
const INITIAL_MOCK_TEAMS: PrototypeTeam[] = [
  {
    id: "team-1",
    name: "Cyber_Warriors",
    members: [
      {
        userId: "u1",
        fullName: "Alex River",
        handle: "alex_dev",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        isLeader: true,
      },
      {
        userId: "u2",
        fullName: "Sarah Connor",
        handle: "sarah_c",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        isLeader: false,
      },
    ],
  },
  {
    id: "team-2",
    name: "Algo_Titans",
    members: [
      {
        userId: "u3",
        fullName: "John Hack",
        handle: "john_hacks",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        isLeader: true,
      },
    ],
  },
  {
    id: "team-3",
    name: "Prisma_Pirates",
    members: [
      {
        userId: "u4",
        fullName: "Dave Code",
        handle: "dev_dave",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        isLeader: true,
      },
      {
        userId: "u5",
        fullName: "Emma Watson",
        handle: "emma_ui",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
        isLeader: false,
      },
    ],
  },
];

export function ArenaDetailClient({ arena, meta }: ArenaDetailClientProps) {
  // Real actor states (no prototype role switcher)
  const isGuest = false; // Set based on auth state
  const [isJoined, setIsJoined] = useState<boolean>(meta.isRegistered);
  const isHost = meta.isOwner;

  // Active module tab state
  const [activeTab, setActiveTab] = useState<"teams" | "submission" | "leaderboard">(
    arena.isTeam ? "teams" : "submission"
  );

  // Dynamic team pools & capacity
  const [teams, setTeams] = useState<PrototypeTeam[]>(INITIAL_MOCK_TEAMS);
  const [totalParticipants, setTotalParticipants] = useState<number>(
    meta.totalParticipants || teams.reduce((sum, t) => sum + t.members.length, 0)
  );

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // ACTOR HANDLERS
  const handleLoginRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  const handleJoin = () => {
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    triggerNotification("Successfully joined the arena!");
  };

  const handleQuit = () => {
    setIsJoined(false);
    setTotalParticipants((prev) => Math.max(0, prev - 1));
    triggerNotification("You have quit the arena.");
  };

  const handleResign = () => {
    setIsJoined(false);
    triggerNotification("You have resigned from this active competition.");
  };

  const handleRequestPrivateJoin = (_code?: string) => {
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    const msg = _code ? `Code ${_code} verified! Joined private arena.` : "Access granted to private arena!";
    triggerNotification(msg);
  };

  const handleJoinTeamPool = (teamId: string, teamName: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: [
                ...t.members,
                {
                  userId: "current-user-id",
                  fullName: "You",
                  handle: "you_dev",
                  avatarUrl: null,
                  isLeader: false,
                },
              ],
            }
          : t
      )
    );
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    triggerNotification(`Joined team pool "${teamName}"!`);
  };

  const handleCreateNewTeamPool = (newTeamName: string) => {
    const newTeam: PrototypeTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      members: [
        {
          userId: "current-user-id",
          fullName: "You (Leader)",
          handle: "you_dev",
          avatarUrl: null,
          isLeader: true,
        },
      ],
    };
    setTeams((prev) => [newTeam, ...prev]);
    setIsJoined(true);
    setTotalParticipants((prev) => prev + 1);
    triggerNotification(`Created new team pool "${newTeamName}"!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-20 space-y-0">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#0E0E0D] text-[#F1EFE9] border-2 border-orange shadow-[4px_4px_0px_0px_#FF5722] p-4 max-w-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-orange shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Showcase with Cover Background, Compact Action Card & Inline Location */}
      <ArenaDetailHero
        id={arena.id}
        title={arena.title}
        description={arena.description}
        coverImageUrl={arena.coverImageUrl}
        additionalImages={arena.additionalImages || []}
        isPrivate={arena.isPrivate}
        isTeam={arena.isTeam}
        minTeamSize={arena.minTeamSize}
        maxTeamSize={arena.maxTeamSize}
        maxParticipants={arena.maxParticipants}
        totalParticipants={totalParticipants}
        status={arena.status}
        registrationStart={arena.registrationStart}
        registrationEnd={arena.registrationEnd}
        inviteCode={arena.inviteCode}
        locationType={((arena as unknown) as Record<string, unknown>).locationType as "IN_PERSON" || "IN_PERSON"}
        venueName={((arena as unknown) as Record<string, unknown>).venueName as string || "CAIRO TECH INNOVATION HUB"}
        googleMapsUrl={((arena as unknown) as Record<string, unknown>).googleMapsUrl as string || "https://maps.google.com/?q=Cairo+Tech+Hub"}
        creator={arena.creator}
        tags={arena.tags}
        isGuest={isGuest}
        isJoined={isJoined}
        isHost={isHost}
        onJoin={handleJoin}
        onQuit={handleQuit}
        onResign={handleResign}
        onLoginRedirect={handleLoginRedirect}
        onRequestPrivateJoin={handleRequestPrivateJoin}
      />

      {/* Main Content Body */}
      <ArenaContainer className="py-10">
        <BackgroundGrid opacity={0.05} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          {/* SECTION: Full Arena Description (server-rendered, SEO-indexed, no CLS) */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
              ABOUT THIS ARENA
            </h2>
            <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6">
              <p className="font-sans text-sm text-[#0E0E0D]/85 leading-[1.9] whitespace-pre-line">
                {arena.description}
              </p>
            </div>
          </section>

          {/* CRITICAL DIRECT SEO CONTENT: Deliverables & Official Rules */}
          <section className="space-y-4 pt-2 border-t border-[#0E0E0D]/10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
              REQUIRED DELIVERABLES & OFFICIAL RULES
            </h2>
            <ArenaOverviewTab
              description={arena.description}
              rulesText={arena.rulesText}
              requireGithubUrl={arena.requireGithubUrl}
              requireFigmaUrl={arena.requireFigmaUrl}
              requireVideoUrl={arena.requireVideoUrl}
              requireWriteup={arena.requireWriteup}
            />
          </section>

          {/* INTERACTIVE MODULES TABBED CONTAINER */}
          <section className="space-y-6 pt-6 border-t-2 border-[#0E0E0D]">
            {/* Tab Header Bar */}
            <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-2 flex flex-wrap gap-2">
              {arena.isTeam && (
                <button
                  onClick={() => setActiveTab("teams")}
                  className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "teams"
                      ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#FF5722]"
                      : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-orange" />
                  <span>TEAM POOLS ({teams.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("submission")}
                className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "submission"
                    ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#10B981]"
                    : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>SUBMISSION PORTAL</span>
              </button>

              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "leaderboard"
                    ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#F59E0B]"
                    : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>LEADERBOARD</span>
              </button>
            </div>

            {/* Active Tab Panel Content */}
            {activeTab === "teams" && arena.isTeam && (
              <ArenaTeamPoolsTab
                teams={teams}
                maxTeamSize={arena.maxTeamSize}
                minTeamSize={arena.minTeamSize}
                currentUserRole={isGuest ? "guest" : isJoined ? "participant" : "user_not_joined"}
                onJoinTeamPool={handleJoinTeamPool}
                onCreateNewTeamPool={handleCreateNewTeamPool}
              />
            )}

            {activeTab === "submission" && (
              <ArenaSubmissionTab
                requireGithubUrl={arena.requireGithubUrl}
                requireFigmaUrl={arena.requireFigmaUrl}
                requireVideoUrl={arena.requireVideoUrl}
                requireWriteup={arena.requireWriteup}
                isRegistered={isJoined || isHost}
              />
            )}

            {activeTab === "leaderboard" && <ArenaLeaderboardTab />}
          </section>

          {/* COMMENTS & DISCUSSION SECTION */}
          <section className="space-y-4 pt-6 border-t-2 border-[#0E0E0D]">
            <ArenaCommentsSection
              isGuest={isGuest}
              onLoginRedirect={handleLoginRedirect}
            />
          </section>
        </div>
      </ArenaContainer>
      <Footer />
    </div>
  );
}

export default ArenaDetailClient;
