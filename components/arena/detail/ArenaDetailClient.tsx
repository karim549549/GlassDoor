"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaDetailHero } from "./ArenaDetailHero";
import { ArenaOverviewTab } from "./ArenaOverviewTab";
import { ArenaInteractiveTabs } from "./ArenaInteractiveTabs";
import { ArenaCommentsSection } from "./ArenaCommentsSection";
import { Footer } from "@/components/home/Footer";
import { PrototypeTeam } from "./ArenaTeamPoolsTab";
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
  const isGuest = false;
  const [isJoined, setIsJoined] = useState<boolean>(meta.isRegistered);
  const isHost = meta.isOwner;

  const [teams, setTeams] = useState<PrototypeTeam[]>(INITIAL_MOCK_TEAMS);
  const [totalParticipants, setTotalParticipants] = useState<number>(
    meta.totalParticipants || teams.reduce((sum, t) => sum + t.members.length, 0)
  );

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

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

  const handleLeaveTeamPool = (teamId: string, teamName: string) => {
    setTeams((prev) =>
      prev
        .map((t) => {
          if (t.id !== teamId) return t;
          const updatedMembers = t.members.filter(
            (m) => m.userId !== "current-user-id" && m.handle !== "you_dev"
          );
          return { ...t, members: updatedMembers };
        })
        .filter((t) => t.members.length > 0)
    );
    triggerNotification(`Left team pool "${teamName}". Your slot has been freed.`);
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

      {/* Hero Component */}
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
          {/* Full Markdown Description */}
          <section id="arena-description" className="space-y-3 scroll-mt-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange font-bold border-b border-[#0E0E0D]/15 pb-2">
              ABOUT THIS ARENA
            </h2>
            <article className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6">
              <div className="prose prose-sm prose-neutral max-w-none text-[#0E0E0D]/85 leading-[1.9]
                prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-[#0E0E0D] prose-headings:font-bold
                prose-h1:text-base prose-h2:text-sm prose-h3:text-xs
                prose-strong:text-[#0E0E0D] prose-strong:font-bold
                prose-code:bg-[#0E0E0D]/5 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-code:text-[#0E0E0D]
                prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
                prose-li:font-sans prose-li:text-sm prose-li:text-[#0E0E0D]/85
                prose-a:text-orange prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[#0E0E0D]/60">
                <ReactMarkdown>{arena.description}</ReactMarkdown>
              </div>
            </article>
          </section>

          {/* Deliverables & Official Rules */}
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

          {/* Interactive Module Tabs (Teams, Submission, Leaderboard) */}
          <ArenaInteractiveTabs
            arena={arena}
            teams={teams}
            isGuest={isGuest}
            isJoined={isJoined}
            isHost={isHost}
            onJoinTeamPool={handleJoinTeamPool}
            onLeaveTeamPool={handleLeaveTeamPool}
            onCreateNewTeamPool={handleCreateNewTeamPool}
          />

          {/* Discussion & Comments Tree */}
          <section className="space-y-4 pt-6 border-t-2 border-[#0E0E0D]">
            <ArenaCommentsSection
              isGuest={isGuest}
              onLoginRedirect={handleLoginRedirect}
            />
          </section>
        </div>
      </ArenaContainer>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ArenaDetailClient;
