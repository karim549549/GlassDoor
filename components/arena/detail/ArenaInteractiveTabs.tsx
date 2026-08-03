"use client";

import React, { useState } from "react";
import { Users, Upload, Trophy } from "lucide-react";
import { ArenaTeamPoolsTab, PrototypeTeam } from "./ArenaTeamPoolsTab";
import { ArenaSubmissionTab } from "./ArenaSubmissionTab";
import { ArenaLeaderboardTab } from "./ArenaLeaderboardTab";

interface ArenaInteractiveTabsProps {
  arena: {
    isTeam: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    requireGithubUrl: boolean;
    requireFigmaUrl: boolean;
    requireVideoUrl: boolean;
    requireWriteup: boolean;
  };
  teams: PrototypeTeam[];
  isGuest: boolean;
  isJoined: boolean;
  isHost: boolean;
  onJoinTeamPool: (teamId: string, teamName: string) => void;
  onCreateNewTeamPool: (teamName: string) => void;
}

export function ArenaInteractiveTabs({
  arena,
  teams,
  isGuest,
  isJoined,
  isHost,
  onJoinTeamPool,
  onCreateNewTeamPool,
}: ArenaInteractiveTabsProps) {
  const [activeTab, setActiveTab] = useState<"teams" | "submission" | "leaderboard">(
    arena.isTeam ? "teams" : "submission"
  );

  return (
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
          onJoinTeamPool={onJoinTeamPool}
          onCreateNewTeamPool={onCreateNewTeamPool}
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
  );
}
