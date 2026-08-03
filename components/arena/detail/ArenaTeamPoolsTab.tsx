"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Plus, UserPlus, Search, Shield } from "lucide-react";

export type PrototypeUserRole = "guest" | "user_not_joined" | "participant" | "host";

export interface PrototypeTeam {
  id: string;
  name: string;
  members: {
    userId: string;
    fullName: string | null;
    handle: string;
    avatarUrl: string | null;
    isLeader: boolean;
  }[];
}

interface ArenaTeamPoolsTabProps {
  teams: PrototypeTeam[];
  maxTeamSize: number;
  minTeamSize: number;
  currentUserRole: PrototypeUserRole;
  onJoinTeamPool: (teamId: string, teamName: string) => void;
  onCreateNewTeamPool: (teamName: string) => void;
}

export function ArenaTeamPoolsTab({
  teams,
  maxTeamSize,
  minTeamSize,
  currentUserRole,
  onJoinTeamPool,
  onCreateNewTeamPool,
}: ArenaTeamPoolsTabProps) {
  // Prototype role tag check
  const isGuest = currentUserRole === "guest";
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    onCreateNewTeamPool(newTeamName.trim());
    setNewTeamName("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar: Title, Search, and Create Team Pool CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>TEAM POOLS & OPEN SLOTS ({teams.length} TEAMS)</span>
          </div>
          <p className="font-mono text-[0.52rem] text-[#0E0E0D]/60 uppercase tracking-widest mt-0.5">
            Team Size Limit: {minTeamSize} – {maxTeamSize} Members per Team Pool
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#0E0E0D]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH TEAMS..."
              className="pl-8 pr-3 py-1.5 font-mono text-[0.58rem] uppercase border border-[#0E0E0D]/30 focus:outline-none focus:border-[#0E0E0D] bg-white text-[#0E0E0D]"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-orange hover:bg-orange/90 text-white font-mono text-[0.58rem] font-bold uppercase tracking-wider border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ CREATE TEAM POOL</span>
          </button>
        </div>
      </div>

      {/* Grid of Team Pool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.length === 0 ? (
          <div className="col-span-2 p-8 bg-white border-2 border-dashed border-[#0E0E0D]/20 text-center font-mono text-xs text-[#0E0E0D]/60 uppercase tracking-widest">
            No team pools matching filter. Be the first to create a team pool!
          </div>
        ) : (
          filteredTeams.map((team) => {
            const memberCount = team.members.length;
            const openSlots = maxTeamSize - memberCount;
            const isFull = openSlots <= 0;

            return (
              <div
                key={team.id}
                className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-4 flex flex-col justify-between space-y-4 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#0E0E0D]">
                        {team.name}
                      </h4>
                      <span className="font-mono text-[0.52rem] uppercase tracking-widest text-[#0E0E0D]/60">
                        TEAM POOL #{team.id.substring(0, 6)}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        isFull
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-emerald-100 text-emerald-900 border-emerald-400"
                      }`}
                    >
                      {isFull ? "FULL (CAP REACHED)" : `${openSlots} OPEN SLOT${openSlots > 1 ? "S" : ""}`}
                    </span>
                  </div>

                  {/* Members Avatars Row */}
                  <div className="space-y-1.5 pt-2 border-t border-[#0E0E0D]/10">
                    <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                      MEMBERS ({memberCount} / {maxTeamSize}):
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {team.members.map((m) => (
                        <div
                          key={m.userId}
                          className="flex items-center gap-1.5 px-2 py-1 bg-[#0E0E0D]/5 border border-[#0E0E0D]/15 font-mono text-[0.55rem]"
                        >
                          <div className="relative w-4 h-4 rounded-full overflow-hidden bg-[#0E0E0D]">
                            {m.avatarUrl ? (
                              <Image src={m.avatarUrl} alt={m.handle} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-white text-[0.4rem]">
                                {m.handle.substring(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-[#0E0E0D]">@{m.handle}</span>
                          {m.isLeader && (
                            <span title="Team Leader">
                              <Shield className="w-2.5 h-2.5 text-orange" />
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Empty slots visual placeholders */}
                      {Array.from({ length: Math.max(0, openSlots) }).map((_, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 border border-dashed border-[#0E0E0D]/30 bg-white font-mono text-[0.55rem] text-[#0E0E0D]/40 italic"
                        >
                          + Open Slot
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-[#0E0E0D]/10">
                  {isFull ? (
                    <button
                      disabled
                      className="w-full py-1.5 bg-gray-100 text-gray-400 font-mono text-[0.58rem] uppercase font-bold border border-gray-300 cursor-not-allowed"
                    >
                      TEAM POOL FULL
                    </button>
                  ) : (
                    <button
                      onClick={() => onJoinTeamPool(team.id, team.name)}
                      className="w-full py-1.5 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.58rem] uppercase tracking-widest font-bold border border-[#0E0E0D] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-orange" />
                      <span>{isGuest ? "SIGN IN TO JOIN POOL" : "JOIN THIS TEAM POOL"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW TEAM POOL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[8px_8px_0px_0px_#0E0E0D] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#0E0E0D]/10 pb-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                CREATE A NEW TEAM POOL
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="font-mono text-xs font-bold text-[#0E0E0D]/60 hover:text-[#0E0E0D]"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-[0.6rem] uppercase tracking-wider font-bold">
                  TEAM POOL NAME:
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. CYBER_WARRIORS_2026"
                  className="w-full px-3 py-2 border-2 border-[#0E0E0D] font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-orange"
                />
              </div>

              <div className="p-3 bg-[#0E0E0D]/5 border border-[#0E0E0D]/15 font-mono text-[0.55rem] uppercase tracking-wider space-y-1 text-[#0E0E0D]/70">
                <p>• You will automatically become the Team Leader.</p>
                <p>• Up to {maxTeamSize - 1} other participants can join your pool.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#0E0E0D] font-mono text-[0.6rem] uppercase font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange text-white font-mono text-[0.6rem] uppercase font-bold border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D]"
                >
                  CREATE TEAM POOL NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArenaTeamPoolsTab;
