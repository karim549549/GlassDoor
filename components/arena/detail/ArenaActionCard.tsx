"use client";

import React, { useState } from "react";
import { Users, Lock, Globe, LogOut, Flag, ArrowRight } from "lucide-react";

interface ArenaActionCardProps {
  isPrivate: boolean;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxParticipants: number | null;
  totalParticipants: number;
  status: string;
  inviteCode?: string | null;
  isGuest: boolean;
  isJoined: boolean;
  isHost: boolean;
  onJoin: () => void;
  onQuit: () => void;
  onResign: () => void;
  onLoginRedirect: () => void;
  onRequestPrivateJoin: (code?: string) => void;
}

export function ArenaActionCard({
  isPrivate,
  isTeam,
  minTeamSize,
  maxTeamSize,
  maxParticipants,
  totalParticipants,
  status,
  inviteCode,
  isGuest,
  isJoined,
  isHost,
  onJoin,
  onQuit,
  onResign,
  onLoginRedirect,
  onRequestPrivateJoin,
}: ArenaActionCardProps) {
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const isFull = maxParticipants !== null && totalParticipants >= maxParticipants;
  const isCompleted = status === "COMPLETED";
  const isRegistrationPhase = status === "REGISTRATION_OPEN" || status === "DRAFT";

  const capacityPercentage = maxParticipants
    ? Math.min(100, Math.round((totalParticipants / maxParticipants) * 100))
    : 0;

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode && inputCode.trim() !== inviteCode.trim()) {
      setCodeError("Invalid code.");
      return;
    }
    setCodeError("");
    onRequestPrivateJoin(inputCode);
  };

  return (
    <div className="w-full bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] p-5 space-y-5">
      {/* Visibility & Format Badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-wider border ${
            isPrivate
              ? "bg-amber-100 text-amber-900 border-amber-400"
              : "bg-emerald-100 text-emerald-900 border-emerald-400"
          }`}
        >
          {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {isPrivate ? "PRIVATE" : "PUBLIC"}
        </span>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-wider bg-[#0E0E0D]/5 border border-[#0E0E0D]/20 text-[#0E0E0D]">
          <Users className="w-3 h-3 text-orange" />
          {isTeam ? `TEAM (${minTeamSize}-${maxTeamSize})` : "SOLO"}
        </span>
      </div>

      {/* Capacity Counter & Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center font-mono text-[0.58rem] uppercase tracking-wider font-bold text-[#0E0E0D]">
          <span>CAPACITY</span>
          <span className="text-orange">
            {totalParticipants} / {maxParticipants ?? "∞"} PLACES
          </span>
        </div>
        {maxParticipants && (
          <div className="w-full h-2.5 bg-[#0E0E0D]/10 border border-[#0E0E0D]/30 p-0.5">
            <div
              className={`h-full transition-all duration-500 ${
                isFull ? "bg-red-500" : "bg-orange"
              }`}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* SINGLE CLEAN THEME-CONSISTENT ACTION BUTTON */}
      <div className="pt-2 border-t border-[#0E0E0D]/10">
        {isHost ? (
          <button className="w-full py-2.5 px-4 bg-[#0E0E0D] hover:bg-white hover:text-[#0E0E0D] text-[#F1EFE9] font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]">
            EDIT ARENA
          </button>
        ) : isJoined ? (
          isCompleted ? (
            <button
              disabled
              className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border border-gray-300 cursor-not-allowed"
            >
              ARENA COMPLETED
            </button>
          ) : isRegistrationPhase ? (
            <button
              onClick={onQuit}
              className="w-full py-2.5 px-4 bg-[#0E0E0D] hover:bg-red-950 text-[#F1EFE9] hover:text-red-300 font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] hover:border-red-500 shadow-[3px_3px_0px_0px_#0E0E0D] flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>QUIT ARENA</span>
            </button>
          ) : (
            <button
              onClick={onResign}
              className="w-full py-2.5 px-4 bg-[#0E0E0D] hover:bg-red-950 text-[#F1EFE9] hover:text-red-300 font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] hover:border-red-500 shadow-[3px_3px_0px_0px_#0E0E0D] flex items-center justify-center gap-2 transition-all"
            >
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span>RESIGN</span>
            </button>
          )
        ) : isFull ? (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border border-gray-300 cursor-not-allowed"
          >
            ARENA FULL
          </button>
        ) : isPrivate && !isGuest ? (
          <form onSubmit={handlePrivateSubmit} className="space-y-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="ENTER INVITE CODE..."
              className="w-full px-3 py-1.5 border-2 border-[#0E0E0D] font-mono text-xs uppercase bg-white focus:outline-none focus:ring-2 focus:ring-orange"
            />
            {codeError && (
              <p className="font-mono text-[0.5rem] text-red-600 font-bold uppercase">{codeError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange text-white font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]"
            >
              JOIN
            </button>
          </form>
        ) : (
          <button
            onClick={isGuest ? onLoginRedirect : onJoin}
            className="w-full py-2.5 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 group"
          >
            <span>JOIN</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ArenaActionCard;
