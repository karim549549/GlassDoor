"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, UserPlus, Search, Shield, Lock, AlertTriangle, Gamepad2, CheckCircle2, UserCheck } from "lucide-react";

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
  status?: string;
  currentUserRole: PrototypeUserRole;
  onJoinTeamPool: (teamId: string, teamName: string) => void;
  onCreateNewTeamPool: (teamName: string) => void;
  onLoginRedirect?: () => void;
}

export function ArenaTeamPoolsTab({
  teams,
  maxTeamSize,
  minTeamSize,
  currentUserRole,
  onJoinTeamPool,
  onCreateNewTeamPool,
  onLoginRedirect = () => {},
}: ArenaTeamPoolsTabProps) {
  const isGuest = currentUserRole === "guest";
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Join Modal State
  const [pendingJoinTeam, setPendingJoinTeam] = useState<{ id: string; name: string } | null>(null);

  // Single Slot Validation
  const currentUserId = "current-user-id";
  const currentUserHandle = "you_dev";

  const myTeam = teams.find((t) =>
    t.members.some((m) => m.userId === currentUserId || m.handle === currentUserHandle)
  );
  const isInAnyTeam = Boolean(myTeam);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || isInAnyTeam) return;
    onCreateNewTeamPool(newTeamName.trim());
    setNewTeamName("");
    setIsCreateModalOpen(false);
  };

  const confirmJoin = () => {
    if (!pendingJoinTeam) return;
    onJoinTeamPool(pendingJoinTeam.id, pendingJoinTeam.name);
    setPendingJoinTeam(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar: Game Lobby Matchmaking Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
            <Gamepad2 className="w-4 h-4 text-orange" />
            <span>SQUAD LOBBIES & MATCHMAKING ({teams.length} LOBBIES ACTIVE)</span>
          </div>
          <p className="font-mono text-[0.52rem] text-[#0E0E0D]/60 uppercase tracking-widest">
            Roster Capacity: {minTeamSize} – {maxTeamSize} Players per Lobby • 1 Slot Per Participant
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {isInAnyTeam && (
            <div className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-600/40 text-emerald-900 font-mono text-[0.55rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SLOT LOCKED @{myTeam?.name}</span>
            </div>
          )}

          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#0E0E0D]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="FILTER LOBBIES..."
              className="w-full sm:w-44 pl-8 pr-3 py-1.5 font-mono text-[0.58rem] uppercase border border-[#0E0E0D]/30 focus:outline-none focus:border-[#0E0E0D] bg-white text-[#0E0E0D]"
            />
          </div>

          <button
            disabled={!isGuest && isInAnyTeam}
            onClick={() => (isGuest ? onLoginRedirect() : !isInAnyTeam && setIsCreateModalOpen(true))}
            className={`px-3 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider border border-[#0E0E0D] flex items-center gap-1 shrink-0 cursor-pointer ${
              !isGuest && isInAnyTeam
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-orange hover:bg-orange/90 text-white shadow-[2px_2px_0px_0px_#0E0E0D]"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isInAnyTeam ? "+ CREATE LOBBY (LOCKED)" : "+ CREATE LOBBY"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Discord / Game Lobby Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTeams.length === 0 ? (
          <div className="col-span-2 p-8 bg-white border-2 border-dashed border-[#0E0E0D]/20 text-center font-mono text-xs text-[#0E0E0D]/60 uppercase tracking-widest">
            No active squad lobbies match your filter. Be the first to host a lobby!
          </div>
        ) : (
          filteredTeams.map((team) => {
            const memberCount = team.members.length;
            const openSlots = maxTeamSize - memberCount;
            const isFull = openSlots <= 0;

            const isUserInThisTeam = team.members.some(
              (m) => m.userId === currentUserId || m.handle === currentUserHandle
            );

            return (
              <div
                key={team.id}
                className={`bg-white border-2 p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isUserInThisTeam
                    ? "border-emerald-600 shadow-[6px_6px_0px_0px_#059669]"
                    : "border-[#0E0E0D] shadow-[5px_5px_0px_0px_#0E0E0D]"
                }`}
              >
                {/* Lobby Room Header */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-[#0E0E0D]/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-mono text-base font-bold uppercase tracking-wider text-[#0E0E0D]">
                          {team.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[0.52rem] uppercase tracking-widest text-[#0E0E0D]/50 block mt-0.5">
                        MATCH LOBBY #{team.id.substring(0, 6)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${
                          isFull
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-400"
                        }`}
                      >
                        {isFull ? "FULL (4/4)" : `${memberCount}/${maxTeamSize} SLOTS`}
                      </span>
                      {isUserInThisTeam && (
                        <span className="font-mono text-[0.48rem] font-bold uppercase px-2 py-0.5 bg-emerald-600 text-white border border-emerald-700 flex items-center gap-1">
                          <UserCheck className="w-2.5 h-2.5" />
                          <span>YOUR SQUAD</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Discord/Game Lobby Slot Rows */}
                  <div className="space-y-2">
                    <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                      ROSTER POSITIONS:
                    </span>

                    <div className="space-y-1.5">
                      {team.members.map((m, slotIdx) => {
                        const isMe = m.userId === currentUserId || m.handle === currentUserHandle;
                        return (
                          <div
                            key={m.userId}
                            className={`p-2 border flex items-center justify-between font-mono text-[0.58rem] transition-colors ${
                              isMe
                                ? "bg-emerald-500/10 border-emerald-600/60 font-bold"
                                : "bg-[#0E0E0D]/5 border-[#0E0E0D]/15"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.5rem] font-bold text-[#0E0E0D]/40">
                                P{slotIdx + 1}
                              </span>
                              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-[#0E0E0D] shrink-0">
                                {m.avatarUrl ? (
                                  <Image src={m.avatarUrl} alt={m.handle} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-[0.45rem]">
                                    {m.handle.substring(0, 1).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-[#0E0E0D]">@{m.handle}</span>
                              {isMe && (
                                <span className="text-[0.45rem] bg-emerald-600 text-white px-1 py-0.2 uppercase font-bold">
                                  YOU
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-[0.5rem] font-bold uppercase tracking-wider text-[#0E0E0D]/60 flex items-center gap-1">
                              {m.isLeader ? (
                                <>
                                  <Shield className="w-3 h-3 text-orange fill-orange/20" />
                                  <span className="text-orange">LEADER</span>
                                </>
                              ) : (
                                <span>READY</span>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Dotted Open Slots */}
                      {Array.from({ length: Math.max(0, openSlots) }).map((_, idx) => {
                        const slotNum = memberCount + idx + 1;
                        const canClaim = !isInAnyTeam && !isGuest;
                        return (
                          <button
                            key={idx}
                            disabled={!canClaim && !isGuest}
                            onClick={() =>
                              isGuest
                                ? onLoginRedirect()
                                : canClaim && setPendingJoinTeam({ id: team.id, name: team.name })
                            }
                            className={`w-full p-2 border-2 border-dashed font-mono text-[0.55rem] uppercase tracking-wider flex items-center justify-between transition-all ${
                              canClaim || isGuest
                                ? "border-orange/40 bg-orange/5 text-orange hover:bg-orange/10 hover:border-orange cursor-pointer"
                                : "border-[#0E0E0D]/20 bg-gray-50 text-[#0E0E0D]/40 cursor-not-allowed"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-bold text-[#0E0E0D]/30">P{slotNum}</span>
                              <span>+ OPEN POSITION</span>
                            </span>
                            <span className="font-bold">
                              {isGuest ? "SIGN IN" : canClaim ? "CLAIM SLOT →" : "LOCKED"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lobby Footer Action */}
                <div className="pt-3 border-t border-[#0E0E0D]/10">
                  {isUserInThisTeam ? (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-700 text-white font-mono text-[0.58rem] uppercase tracking-widest font-bold border border-emerald-800 flex items-center justify-center gap-1.5 cursor-default shadow-[2px_2px_0px_0px_#047857]"
                    >
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span>YOUR ASSIGNED LOBBY (SLOT CONFIRMED)</span>
                    </button>
                  ) : isInAnyTeam ? (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-100 text-gray-400 font-mono text-[0.58rem] uppercase font-bold border border-gray-300 cursor-not-allowed"
                    >
                      ASSIGNED TO LOBBY &quot;{myTeam?.name}&quot;
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-100 text-gray-400 font-mono text-[0.58rem] uppercase font-bold border border-gray-300 cursor-not-allowed"
                    >
                      LOBBY FULL (4/4)
                    </button>
                  ) : (
                    <button
                      onClick={() => (isGuest ? onLoginRedirect() : setPendingJoinTeam({ id: team.id, name: team.name }))}
                      className="w-full py-2 bg-[#0E0E0D] hover:bg-orange hover:text-white text-[#F1EFE9] font-mono text-[0.58rem] uppercase tracking-widest font-bold border border-[#0E0E0D] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#0E0E0D]"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-orange" />
                      <span>{isGuest ? "SIGN IN TO REQUEST SLOT" : "REQUEST TO JOIN LOBBY"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRM JOIN LOBBY MODAL */}
      {pendingJoinTeam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[8px_8px_0px_0px_#0E0E0D] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#0E0E0D]/10 pb-3">
              <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                CONFIRM SQUAD LOBBY JOIN
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#0E0E0D]/80 leading-relaxed">
              <p>
                You are requesting to claim an open slot in squad lobby <strong className="text-[#0E0E0D] font-bold">&quot;{pendingJoinTeam.name}&quot;</strong>.
              </p>
              <div className="p-3 bg-orange/10 border border-orange/30 font-mono text-[0.58rem] uppercase space-y-1 text-orange font-bold">
                <p>• THIS LOCKS YOUR SINGLE PARTICIPANT SLOT FOR THIS ARENA.</p>
                <p>• YOU CANNOT BE IN MULTIPLE SQUAD LOBBIES SIMULTANEOUSLY.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#0E0E0D]/10">
              <button
                type="button"
                onClick={() => setPendingJoinTeam(null)}
                className="px-4 py-2 border border-[#0E0E0D] font-mono text-[0.6rem] uppercase font-bold hover:bg-[#0E0E0D]/5 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmJoin}
                className="px-5 py-2 bg-orange hover:bg-orange/90 text-white font-mono text-[0.6rem] uppercase font-bold border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] cursor-pointer transition-colors"
              >
                CONFIRM & CLAIM SLOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LOBBY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[8px_8px_0px_0px_#0E0E0D] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#0E0E0D]/10 pb-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                HOST A NEW SQUAD LOBBY
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
                  SQUAD LOBBY NAME:
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
                <p>• You will automatically occupy Slot P1 as Squad Leader.</p>
                <p>• Up to {maxTeamSize - 1} other participants can claim open slots in your lobby.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#0E0E0D] font-mono text-[0.6rem] uppercase font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange hover:bg-orange/90 text-white font-mono text-[0.6rem] uppercase font-bold border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] cursor-pointer"
                >
                  HOST SQUAD LOBBY NOW
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
