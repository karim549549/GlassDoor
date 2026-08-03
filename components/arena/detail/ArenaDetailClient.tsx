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
import { ArenaHostCard } from "./ArenaHostCard";
import { PrototypeUserRole } from "./ArenaActionCard";
import { FileText, Users, Upload, Trophy, CheckCircle2 } from "lucide-react";

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

// Prototype initial mock team pools with real Unsplash avatars
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

  // PROTOTYPE STATE CONTROLS
  const [currentUserRole, setCurrentUserRole] = useState<PrototypeUserRole>(
    meta.isOwner ? "host" : meta.isRegistered ? "participant" : "user_not_joined"
  );
  const [activeTab, setActiveTab] = useState<"overview" | "teams" | "submission" | "leaderboard">("overview");

  // Dynamic prototype team pools state
  const [teams, setTeams] = useState<PrototypeTeam[]>(INITIAL_MOCK_TEAMS);
  const [totalParticipants, setTotalParticipants] = useState<number>(
    meta.totalParticipants || teams.reduce((sum, t) => sum + t.members.length, 0)
  );

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // HANDLERS
  const handleLoginRedirect = () => {
    triggerNotification("Redirecting guest user to sign in page...");
  };

  const handleJoinSolo = () => {
    setCurrentUserRole("participant");
    setTotalParticipants((prev) => prev + 1);
    triggerNotification("Success! You have registered as a solo participant.");
  };

  const handleOpenTeamModal = () => {
    setActiveTab("teams");
    triggerNotification("Select an open team pool below or create your own!");
  };

  const handleRequestPrivateJoin = (_code?: string) => {
    setCurrentUserRole("participant");
    setTotalParticipants((prev) => prev + 1);
    const msg = _code ? `Private code verified: ${_code}. Joined arena!` : "Private request submitted! Access granted to arena.";
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
                  fullName: "You (Participant)",
                  handle: "you_dev",
                  avatarUrl: null,
                  isLeader: false,
                },
              ],
            }
          : t
      )
    );
    setCurrentUserRole("participant");
    setTotalParticipants((prev) => prev + 1);
    triggerNotification(`Joined team pool "${teamName}" successfully!`);
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
    setCurrentUserRole("participant");
    setTotalParticipants((prev) => prev + 1);
    triggerNotification(`Created new team pool "${newTeamName}"! You are the Team Leader.`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0 pb-20 space-y-0">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#0E0E0D] text-[#F1EFE9] border-2 border-orange shadow-[4px_4px_0px_0px_#FF5722] p-4 max-w-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-orange shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Showcase with Cover Image & Rich Metadata */}
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
        currentUserRole={currentUserRole}
        onChangeUserRole={setCurrentUserRole}
        onJoinSolo={handleJoinSolo}
        onOpenTeamModal={handleOpenTeamModal}
        onRequestPrivateJoin={handleRequestPrivateJoin}
        onGoToSubmission={() => setActiveTab("submission")}
        onLoginRedirect={handleLoginRedirect}
      />

      {/* Phase Stepper Bar */}
      <ArenaTimelineStepper
        status={arena.status}
        registrationStart={arena.registrationStart}
        registrationEnd={arena.registrationEnd}
        ideaPhaseStart={arena.ideaPhaseStart}
        ideaPhaseEnd={arena.ideaPhaseEnd}
        implPhaseStart={arena.implPhaseStart}
        implPhaseEnd={arena.implPhaseEnd}
      />

      {/* Main Content 2-Column Grid */}
      <ArenaContainer className="py-10">
        <BackgroundGrid opacity={0.05} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area (8/12 = ~70%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tab Header Navigation */}
            <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-2 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#FF5722]"
                    : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-orange" />
                <span>OVERVIEW & RULES</span>
              </button>

              {arena.isTeam && (
                <button
                  onClick={() => setActiveTab("teams")}
                  className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 ${
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
                className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 ${
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
                className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 ${
                  activeTab === "leaderboard"
                    ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#F59E0B]"
                    : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>LEADERBOARD</span>
              </button>
            </div>

            {/* Active Tab Panel Rendering */}
            {activeTab === "overview" && (
              <ArenaOverviewTab
                description={arena.description}
                rulesText={arena.rulesText}
                requireGithubUrl={arena.requireGithubUrl}
                requireFigmaUrl={arena.requireFigmaUrl}
                requireVideoUrl={arena.requireVideoUrl}
                requireWriteup={arena.requireWriteup}
              />
            )}

            {activeTab === "teams" && (
              <ArenaTeamPoolsTab
                teams={teams}
                maxTeamSize={arena.maxTeamSize}
                minTeamSize={arena.minTeamSize}
                currentUserRole={currentUserRole}
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
                isRegistered={currentUserRole === "participant" || currentUserRole === "host"}
              />
            )}

            {activeTab === "leaderboard" && <ArenaLeaderboardTab />}
          </div>

          {/* Sidebar Area (4/12 = ~30%) */}
          <div className="lg:col-span-4 space-y-6">
            <ArenaHostCard
              creator={arena.creator}
              isPrivate={arena.isPrivate}
              inviteCode={arena.inviteCode}
            />
          </div>
        </div>
      </ArenaContainer>
    </div>
  );
}

export default ArenaDetailClient;
