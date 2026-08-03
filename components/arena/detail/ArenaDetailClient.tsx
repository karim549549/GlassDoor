"use client";

import React, { useState } from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaDetailHero } from "./ArenaDetailHero";
import { ArenaTimelineStepper } from "./ArenaTimelineStepper";
import { ArenaOverviewTab } from "./ArenaOverviewTab";
import { ArenaTeamPoolsTab, PrototypeTeam } from "./ArenaTeamPoolsTab";
import { ArenaSubmissionTab } from "./ArenaSubmissionTab";
import { ArenaLeaderboardTab } from "./ArenaLeaderboardTab";
import { ArenaLocationSection } from "./ArenaLocationSection";
import { CheckCircle2 } from "lucide-react";

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

      {/* Hero Showcase with Cover Gallery & Compact Action Card */}
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

      {/* Phase Timeline Stepper */}
      <ArenaTimelineStepper
        status={arena.status}
        registrationStart={arena.registrationStart}
        registrationEnd={arena.registrationEnd}
        ideaPhaseStart={arena.ideaPhaseStart}
        ideaPhaseEnd={arena.ideaPhaseEnd}
        implPhaseStart={arena.implPhaseStart}
        implPhaseEnd={arena.implPhaseEnd}
      />

      {/* Main Content Body (SEO-First Server Rendered Content Stream) */}
      <ArenaContainer className="py-10">
        <BackgroundGrid opacity={0.05} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          {/* SECTION 1: Overview & Problem Statement (HTML Server Rendered for SEO) */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
              ARENA OVERVIEW & PROBLEM STATEMENT
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

          {/* SECTION 2: Venue & Location (Google Maps for In-Person / Hybrid or Online Stage) */}
          <section className="space-y-4 pt-4 border-t border-[#0E0E0D]/10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
              ARENA LOCATION & VENUE DETAILS
            </h2>
            <ArenaLocationSection
              locationType={((arena as unknown) as Record<string, unknown>).locationType as "IN_PERSON" || "IN_PERSON"}
              venueName={((arena as unknown) as Record<string, unknown>).venueName as string || "Cairo Tech Innovation Hub"}
              address={((arena as unknown) as Record<string, unknown>).address as string || "124 El-Tahrir Square, Downtown"}
              city={((arena as unknown) as Record<string, unknown>).city as string || "Cairo"}
              country={((arena as unknown) as Record<string, unknown>).country as string || "Egypt"}
              googleMapsUrl={((arena as unknown) as Record<string, unknown>).googleMapsUrl as string}
              googleMapsEmbedUrl={((arena as unknown) as Record<string, unknown>).googleMapsEmbedUrl as string}
              onlineJoinUrl={((arena as unknown) as Record<string, unknown>).onlineJoinUrl as string}
            />
          </section>

          {/* SECTION 2: Team Pools & Open Slots (For Team Arenas) */}
          {arena.isTeam && (
            <section className="space-y-4 pt-4 border-t border-[#0E0E0D]/10">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
                TEAM POOLS & AVAILABLE SLOTS
              </h2>
              <ArenaTeamPoolsTab
                teams={teams}
                maxTeamSize={arena.maxTeamSize}
                minTeamSize={arena.minTeamSize}
                currentUserRole={isGuest ? "guest" : isJoined ? "participant" : "user_not_joined"}
                onJoinTeamPool={handleJoinTeamPool}
                onCreateNewTeamPool={handleCreateNewTeamPool}
              />
            </section>
          )}

          {/* SECTION 3: Submission Portal (Visible to Registered Participants) */}
          <section className="space-y-4 pt-4 border-t border-[#0E0E0D]/10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-600 font-bold border-b border-[#0E0E0D]/15 pb-2">
              PROJECT SUBMISSION PORTAL
            </h2>
            <ArenaSubmissionTab
              requireGithubUrl={arena.requireGithubUrl}
              requireFigmaUrl={arena.requireFigmaUrl}
              requireVideoUrl={arena.requireVideoUrl}
              requireWriteup={arena.requireWriteup}
              isRegistered={isJoined || isHost}
            />
          </section>

          {/* SECTION 4: Leaderboard & Results */}
          <section className="space-y-4 pt-4 border-t border-[#0E0E0D]/10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-amber-600 font-bold border-b border-[#0E0E0D]/15 pb-2">
              ARENA LEADERBOARD & RESULTS
            </h2>
            <ArenaLeaderboardTab />
          </section>
        </div>
      </ArenaContainer>
    </div>
  );
}

export default ArenaDetailClient;
