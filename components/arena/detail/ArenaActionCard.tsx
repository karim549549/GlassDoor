"use client";

import React, { useState } from "react";
import { Users, Lock, Globe, UserCheck, LogOut, Flag, ArrowRight } from "lucide-react";

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

      {/* DYNAMIC ACTION BUTTON BASED ON ACTOR & PHASE */}
      <div className="pt-2 border-t border-[#0E0E0D]/10 space-y-3">
        {/* CASE 1: HOST */}
        {isHost ? (
          <button className="w-full py-2 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.6rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D]">
            EDIT ARENA
          </button>
        ) : isJoined ? (
          /* CASE 2: JOINED PARTICIPANT (Phase-aware Quit vs Resign vs Completed) */
          <div className="space-y-2">
            <div className="p-2 bg-emerald-50 border border-emerald-400 text-center font-mono text-[0.55rem] text-emerald-900 uppercase font-bold flex items-center justify-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>YOU ARE PARTICIPATING</span>
            </div>

            {!isCompleted && (
              isRegistrationPhase ? (
                /* During Registration Phase -> Quit Arena */
                <button
                  onClick={onQuit}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-red-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>QUIT ARENA</span>
                </button>
              ) : (
                /* During Active Phase -> Resign */
                <button
                  onClick={onResign}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>RESIGN FROM ARENA</span>
                </button>
              )
            )}
          </div>
        ) : isFull ? (
          /* CASE 3: CAPACITY FULL */
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-gray-300 cursor-not-allowed"
          >
            ARENA FULL
          </button>
        ) : isPrivate && !isGuest ? (
          /* CASE 4: PRIVATE ARENA ACCESS CODE FORM */
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
              className="w-full py-2 px-4 bg-orange text-white font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D]"
            >
              JOIN
            </button>
          </form>
        ) : (
          /* CASE 5: UNJOINED USER OR GUEST -> SINGLE CLEAN "JOIN" BUTTON */
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
