"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, UserPlus, Search, Shield, Lock, AlertTriangle, Gamepad2, UserCheck, Filter } from "lucide-react";
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



export function ArenaTeamMatchmakingClient({
  maxTeamSize,
  minTeamSize,
}: ArenaTeamMatchmakingClientProps) {
  const [teams, setTeams] = useState<PrototypeTeam[]>(INITIAL_TEAMS);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [accessibilityMode, setAccessibilityMode] = useState<"PUBLIC" | "REQUEST" | "PRIVATE">("PUBLIC");
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [pendingJoinTeam, setPendingJoinTeam] = useState<{ id: string; name: string } | null>(null);

  const SUGGESTED_INVITES = [
    { handle: "marcus_ai", name: "Marcus Vance", role: "AI / ML Engineer" },
    { handle: "elena_ui", name: "Elena Rostova", role: "UI / UX Designer" },
    { handle: "vector_dev", name: "Vector Chen", role: "Backend Developer" },
    { handle: "sarah_c", name: "Sarah Connor", role: "DevOps / Infrastructure" },
  ];

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

    const initialMembers = [
      {
        userId: currentUserId,
        fullName: "You (Leader)",
        handle: currentUserHandle,
        avatarUrl: null,
        isLeader: true,
      },
      ...invitedMembers.map((handle, idx) => ({
        userId: `invited-${idx}-${Date.now()}`,
        fullName: `@${handle}`,
        handle: handle,
        avatarUrl: null,
        isLeader: false,
      })),
    ];

    const newTeam: PrototypeTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      members: initialMembers,
    };
    setTeams((prev) => [newTeam, ...prev]);
    setNewTeamName("");
    setInvitedMembers([]);
    setInviteInput("");
    setAccessibilityMode("PUBLIC");
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

      {/* CREATE NEW SQUAD MODAL (Spacious max-w-2xl layout) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[10px_10px_0px_0px_#0E0E0D] max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex justify-between items-start border-b-2 border-[#0E0E0D] pb-4">
              <div>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-orange font-bold block">
                  ⚡ CREATE &amp; CONFIGURE SQUAD
                </span>
                <h3 className="font-mono text-xl font-bold uppercase tracking-wider text-[#0E0E0D]">
                  HOST A NEW SQUAD
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-2 py-1 bg-[#0E0E0D] text-white font-mono text-xs font-bold hover:bg-orange transition-colors cursor-pointer"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* 1. SQUAD NAME */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-mono text-xs uppercase tracking-wider font-bold text-[#0E0E0D]">
                    SQUAD NAME <span className="text-orange">*</span>
                  </label>
                  <span className="font-mono text-[0.52rem] uppercase font-bold text-[#0E0E0D]/50">
                    MUST BE UNIQUE PER ARENA
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. CYBER_WARRIORS_2026"
                  className="w-full px-4 py-2.5 border-2 border-[#0E0E0D] font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange bg-white"
                />
              </div>

              {/* 2. INVITE TEAMMATES WITH AUTO-RECOMMENDATION DROPDOWN */}
              <div className="space-y-2 relative">
                <label className="block font-mono text-xs uppercase tracking-wider font-bold text-[#0E0E0D]">
                  INVITE TEAMMATES (OPTIONAL)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inviteInput}
                    onFocus={() => setShowInviteDropdown(true)}
                    onChange={(e) => {
                      setInviteInput(e.target.value);
                      setShowInviteDropdown(true);
                    }}
                    placeholder="TYPE HANDLE OR SELECT RECENT PARTICIPANTS BELOW..."
                    className="w-full px-4 py-2 border-2 border-[#0E0E0D] font-mono text-xs uppercase focus:outline-none focus:border-orange bg-white"
                  />
                  {showInviteDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] z-30 max-h-48 overflow-y-auto divide-y divide-[#0E0E0D]/10">
                      <div className="p-2 bg-[#0E0E0D]/5 font-mono text-[0.52rem] uppercase font-bold text-[#0E0E0D]/60">
                        RECOMMENDED &amp; RECENT PARTICIPANTS:
                      </div>
                      {SUGGESTED_INVITES.filter(
                        (s) =>
                          !invitedMembers.includes(s.handle) &&
                          (s.handle.toLowerCase().includes(inviteInput.toLowerCase()) ||
                            s.name.toLowerCase().includes(inviteInput.toLowerCase()))
                      ).map((s) => (
                        <button
                          key={s.handle}
                          type="button"
                          onClick={() => {
                            setInvitedMembers((prev) => [...prev, s.handle]);
                            setInviteInput("");
                            setShowInviteDropdown(false);
                          }}
                          className="w-full p-2.5 text-left hover:bg-orange/10 flex items-center justify-between font-mono text-xs transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-[#0E0E0D]">@{s.handle}</span>
                            <span className="text-[0.55rem] text-[#0E0E0D]/60 block">{s.name} • {s.role}</span>
                          </div>
                          <span className="text-[0.55rem] font-bold uppercase text-orange">+ INVITE</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Member Pills */}
                {invitedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {invitedMembers.map((handle) => (
                      <span
                        key={handle}
                        className="px-3 py-1 bg-[#0E0E0D] text-white font-mono text-[0.58rem] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#0E0E0D]"
                      >
                        <span>@{handle}</span>
                        <button
                          type="button"
                          onClick={() => setInvitedMembers((prev) => prev.filter((h) => h !== handle))}
                          className="text-orange hover:text-white font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. SQUAD ACCESSIBILITY / JOINING MODE SETTINGS */}
              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase tracking-wider font-bold text-[#0E0E0D]">
                  SQUAD ACCESSIBILITY MODE:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PUBLIC */}
                  <button
                    type="button"
                    onClick={() => setAccessibilityMode("PUBLIC")}
                    className={`p-3 border-2 text-left font-mono transition-all cursor-pointer ${
                      accessibilityMode === "PUBLIC"
                        ? "border-emerald-600 bg-emerald-500/10 shadow-[3px_3px_0px_0px_#059669]"
                        : "border-[#0E0E0D]/20 bg-white hover:border-[#0E0E0D]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-800">🟢 PUBLIC</span>
                    </div>
                    <p className="text-[0.52rem] text-[#0E0E0D]/70 uppercase mt-1 leading-tight">
                      ANY PARTICIPANT CAN CLAIM SLOTS INSTANTLY.
                    </p>
                  </button>

                  {/* REQUEST ONLY */}
                  <button
                    type="button"
                    onClick={() => setAccessibilityMode("REQUEST")}
                    className={`p-3 border-2 text-left font-mono transition-all cursor-pointer ${
                      accessibilityMode === "REQUEST"
                        ? "border-amber-600 bg-amber-500/10 shadow-[3px_3px_0px_0px_#D97706]"
                        : "border-[#0E0E0D]/20 bg-white hover:border-[#0E0E0D]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-amber-800">🟡 REQUEST ONLY</span>
                    </div>
                    <p className="text-[0.52rem] text-[#0E0E0D]/70 uppercase mt-1 leading-tight">
                      REQUIRES LEADER APPROVAL TO JOIN.
                    </p>
                  </button>

                  {/* PRIVATE */}
                  <button
                    type="button"
                    onClick={() => setAccessibilityMode("PRIVATE")}
                    className={`p-3 border-2 text-left font-mono transition-all cursor-pointer ${
                      accessibilityMode === "PRIVATE"
                        ? "border-red-600 bg-red-500/10 shadow-[3px_3px_0px_0px_#DC2626]"
                        : "border-[#0E0E0D]/20 bg-white hover:border-[#0E0E0D]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-red-800">🔴 PRIVATE</span>
                    </div>
                    <p className="text-[0.52rem] text-[#0E0E0D]/70 uppercase mt-1 leading-tight">
                      CLOSED LOBBY. REQUIRES INVITE CODE.
                    </p>
                  </button>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-[#0E0E0D]/5 border border-[#0E0E0D]/20 font-mono text-[0.58rem] uppercase tracking-wider space-y-1 text-[#0E0E0D]/80">
                <p>• You will automatically occupy Slot P1 as Squad Leader.</p>
                <p>• Up to {maxTeamSize - 1} other participants can join your squad.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t-2 border-[#0E0E0D]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 border-2 border-[#0E0E0D] font-mono text-xs uppercase font-bold hover:bg-[#0E0E0D]/5 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange hover:bg-orange/90 text-white font-mono text-xs uppercase font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] transition-colors cursor-pointer"
                >
                  CREATE SQUAD NOW →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
