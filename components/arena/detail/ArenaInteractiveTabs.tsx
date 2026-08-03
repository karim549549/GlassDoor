"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Trophy, Gamepad2, ArrowRight } from "lucide-react";
import { ArenaTeamPoolsTab, PrototypeTeam } from "./ArenaTeamPoolsTab";
import { ArenaLeaderboardTab } from "./ArenaLeaderboardTab";

interface ArenaInteractiveTabsProps {
  arenaId?: string;
  arena: {
    status?: string;
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
  onLoginRedirect: () => void;
}

export function ArenaInteractiveTabs({
  arenaId = "cyberpunk-algorithm-battle-2026",
  arena,
  teams,
  isGuest,
  isJoined,
  onJoinTeamPool,
  onCreateNewTeamPool,
  onLoginRedirect,
}: ArenaInteractiveTabsProps) {
  const [activeTab, setActiveTab] = useState<"teams" | "leaderboard">(
    arena.isTeam ? "teams" : "leaderboard"
  );

  return (
    <section className="space-y-6 pt-6 border-t-2 border-[#0E0E0D]">
      {/* Tab Header Bar */}
      <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
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
              <span>SQUAD LOBBIES ({teams.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-2.5 px-4 font-mono text-[0.62rem] uppercase tracking-wider font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-[#0E0E0D] text-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#F59E0B]"
                : "bg-white text-[#0E0E0D] border-transparent hover:border-[#0E0E0D]/20"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>LEADERBOARD STANDINGS</span>
          </button>
        </div>

        {arena.isTeam && (
          <Link
            href={`/arena/${arenaId}/teams`}
            className="px-3 py-2 bg-orange hover:bg-orange/90 text-white font-mono text-[0.58rem] uppercase font-bold tracking-wider border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>OPEN MATCHMAKING HUB →</span>
          </Link>
        )}
      </div>

      {/* Active Tab Panel Content */}
      {activeTab === "teams" && arena.isTeam && (
        <div className="space-y-4">
          {/* Teaser Banner */}
          <div className="p-4 bg-orange/10 border-2 border-orange/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#0E0E0D]">
            <div className="space-y-1">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold block">
                👥 SQUAD MATCHMAKING & RECRUITMENT ACTIVE
              </span>
              <p className="font-mono text-xs text-[#0E0E0D]/80">
                Browse open slots, host a lobby, or recruit free agents on the dedicated Matchmaking Hub.
              </p>
            </div>

            <Link
              href={`/arena/${arenaId}/teams`}
              className="px-4 py-2 bg-[#0E0E0D] hover:bg-orange text-[#F1EFE9] hover:text-white font-mono text-[0.6rem] uppercase font-bold tracking-wider border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#FF5722] flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>BROWSE ALL LOBBIES & MATCHMAKER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ArenaTeamPoolsTab
            teams={teams}
            maxTeamSize={arena.maxTeamSize}
            minTeamSize={arena.minTeamSize}
            status={arena.status}
            currentUserRole={isGuest ? "guest" : isJoined ? "participant" : "user_not_joined"}
            onJoinTeamPool={onJoinTeamPool}
            onCreateNewTeamPool={onCreateNewTeamPool}
            onLoginRedirect={onLoginRedirect}
          />
        </div>
      )}

      {activeTab === "leaderboard" && <ArenaLeaderboardTab />}
    </section>
  );
}
