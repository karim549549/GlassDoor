"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Gamepad2, Plus, Search, Shield, Lock, AlertTriangle, UserCheck, UserPlus, Filter, User } from "lucide-react";
import { PrototypeTeam } from "./ArenaTeamPoolsTab";

interface ArenaTeamMatchmakingClientProps {
  arenaId: string;
  arenaTitle: string;
  minTeamSize: number;
  maxTeamSize: number;
  slugParam: string;
}

const INITIAL_TEAMS: PrototypeTeam[] = [
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
      {
        userId: "u3",
        fullName: "John Hack",
        handle: "john_hacks",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        isLeader: false,
      },
    ],
  },
  {
    id: "team-2",
    name: "Algo_Titans",
    members: [
      {
        userId: "u4",
        fullName: "Dave Code",
        handle: "dev_dave",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        isLeader: true,
      },
    ],
  },
  {
    id: "team-3",
    name: "Prisma_Pirates",
    members: [
      {
        userId: "u5",
        fullName: "Emma Watson",
        handle: "emma_ui",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
        isLeader: true,
      },
    ],
  },
];

interface FreeAgent {
  id: string;
  handle: string;
  fullName: string;
  role: string;
  avatarUrl: string;
  bio: string;
}

const INITIAL_FREE_AGENTS: FreeAgent[] = [
  {
    id: "fa-1",
    handle: "marcus_ai",
    fullName: "Marcus Vance",
    role: "AI / ML Engineer",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    bio: "Specialized in PyTorch, ONNX runtime optimization, and high-concurrency microservices.",
  },
  {
    id: "fa-2",
    handle: "elena_ui",
    fullName: "Elena Rostova",
    role: "UI / UX & Frontend",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    bio: "Next.js 15, Tailwind v4, brutalist design systems, animations.",
  },
  {
    id: "fa-3",
    handle: "vector_dev",
    fullName: "Vector Chen",
    role: "Distributed Systems",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    bio: "Kafka, gRPC, Go, Rust. Looking for a competitive team targeting 1st place.",
  },
];

export function ArenaTeamMatchmakingClient({
  maxTeamSize,
  minTeamSize,
}: ArenaTeamMatchmakingClientProps) {
  const [teams, setTeams] = useState<PrototypeTeam[]>(INITIAL_TEAMS);
  const [freeAgents] = useState<FreeAgent[]>(INITIAL_FREE_AGENTS);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [pendingJoinTeam, setPendingJoinTeam] = useState<{ id: string; name: string } | null>(null);

  // Single slot check
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

    const newTeam: PrototypeTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      members: [
        {
          userId: currentUserId,
          fullName: "You (Leader)",
          handle: currentUserHandle,
          avatarUrl: null,
          isLeader: true,
        },
      ],
    };
    setTeams((prev) => [newTeam, ...prev]);
    setNewTeamName("");
    setIsCreateModalOpen(false);
  };

  const confirmJoin = () => {
    if (!pendingJoinTeam) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === pendingJoinTeam.id
          ? {
              ...t,
              members: [
                ...t.members,
                {
                  userId: currentUserId,
                  fullName: "You",
                  handle: currentUserHandle,
                  avatarUrl: null,
                  isLeader: false,
                },
              ],
            }
          : t
      )
    );
    setPendingJoinTeam(null);
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Control Bar */}
      <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0E0E0D]/10 pb-4">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
            <Gamepad2 className="w-4 h-4 text-orange" />
            <span>MATCHMAKING LOBBIES & SQUAD SEARCH</span>
          </div>

          <button
            disabled={isInAnyTeam}
            onClick={() => !isInAnyTeam && setIsCreateModalOpen(true)}
            className={`px-4 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-wider border-2 border-[#0E0E0D] flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isInAnyTeam
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-orange hover:bg-orange/90 text-white shadow-[2px_2px_0px_0px_#0E0E0D]"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isInAnyTeam ? "+ CREATE LOBBY (LOCKED)" : "+ HOST NEW SQUAD LOBBY"}</span>
          </button>
        </div>

        {/* Role Filters & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-mono text-[0.52rem] uppercase font-bold text-[#0E0E0D]/50 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>ROLES:</span>
            </span>
            {["ALL", "FRONTEND", "BACKEND", "AI / ML", "DESIGN"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`py-1 px-3 font-mono text-[0.55rem] font-bold uppercase border transition-colors cursor-pointer shrink-0 ${
                  roleFilter === role
                    ? "bg-[#0E0E0D] text-white border-[#0E0E0D]"
                    : "bg-white text-[#0E0E0D] border-[#0E0E0D]/20 hover:border-[#0E0E0D]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#0E0E0D]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH BY TEAM NAME..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 font-mono text-[0.58rem] uppercase border border-[#0E0E0D]/30 focus:outline-none focus:border-[#0E0E0D] bg-white text-[#0E0E0D]"
            />
          </div>
        </div>
      </div>

      {/* Lobbies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs uppercase font-bold text-[#0E0E0D]">
          <span>ACTIVE MATCHMAKING LOBBIES ({filteredTeams.length})</span>
          <span className="text-[0.55rem] text-[#0E0E0D]/50">LIMIT: {minTeamSize}–{maxTeamSize} PLAYERS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTeams.map((team) => {
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
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-[#0E0E0D]/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
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

                  {/* Position Rows */}
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
                            className={`p-2 border flex items-center justify-between font-mono text-[0.58rem] ${
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
                        const canClaim = !isInAnyTeam;
                        return (
                          <button
                            key={idx}
                            disabled={!canClaim}
                            onClick={() => canClaim && setPendingJoinTeam({ id: team.id, name: team.name })}
                            className={`w-full p-2 border-2 border-dashed font-mono text-[0.55rem] uppercase tracking-wider flex items-center justify-between transition-all ${
                              canClaim
                                ? "border-orange/40 bg-orange/5 text-orange hover:bg-orange/10 hover:border-orange cursor-pointer"
                                : "border-[#0E0E0D]/20 bg-gray-50 text-[#0E0E0D]/40 cursor-not-allowed"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-bold text-[#0E0E0D]/30">P{slotNum}</span>
                              <span>+ OPEN POSITION</span>
                            </span>
                            <span className="font-bold">{canClaim ? "CLAIM SLOT →" : "LOCKED"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
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
                      onClick={() => setPendingJoinTeam({ id: team.id, name: team.name })}
                      className="w-full py-2 bg-[#0E0E0D] hover:bg-orange hover:text-white text-[#F1EFE9] font-mono text-[0.58rem] uppercase tracking-widest font-bold border border-[#0E0E0D] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#0E0E0D]"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-orange" />
                      <span>REQUEST TO JOIN LOBBY</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Agent Pool Section */}
      <section className="space-y-4 pt-6 border-t-2 border-[#0E0E0D]">
        <div className="flex items-center justify-between border-b-2 border-[#0E0E0D] pb-3">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
            <User className="w-4 h-4 text-orange" />
            <span>FREE AGENTS & UNASSIGNED PARTICIPANTS ({freeAgents.length})</span>
          </div>
          <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold">
            AVAILABLE FOR RECRUITMENT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {freeAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#0E0E0D] shrink-0 border border-[#0E0E0D]">
                    <Image src={agent.avatarUrl} alt={agent.handle} fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className="font-mono text-xs font-bold text-[#0E0E0D]">@{agent.handle}</h5>
                    <span className="font-mono text-[0.5rem] uppercase tracking-wider text-orange font-bold block">
                      {agent.role}
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[0.55rem] text-[#0E0E0D]/70 leading-relaxed">
                  {agent.bio}
                </p>
              </div>

              <button className="w-full py-1.5 bg-[#0E0E0D] hover:bg-orange text-[#F1EFE9] font-mono text-[0.55rem] uppercase tracking-widest font-bold border border-[#0E0E0D] transition-colors cursor-pointer">
                RECRUIT TO SQUAD →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIRM JOIN MODAL */}
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
