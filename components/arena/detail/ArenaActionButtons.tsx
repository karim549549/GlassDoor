"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, Flag, ArrowRight, Gamepad2 } from "lucide-react";

interface ArenaActionButtonsProps {
  isGuest: boolean;
  isJoined: boolean;
  isHost: boolean;
  isFull: boolean;
  isCompleted: boolean;
  isRegistrationPhase: boolean;
  isPrivate: boolean;
  isTeam?: boolean;
  arenaSlug?: string;
  inviteCode?: string | null;
  onJoin: () => void;
  onQuit: () => void;
  onResign: () => void;
  onLoginRedirect: () => void;
  onRequestPrivateJoin: (code?: string) => void;
}

export function ArenaActionButtons({
  isGuest,
  isJoined,
  isHost,
  isFull,
  isCompleted,
  isRegistrationPhase,
  isPrivate,
  isTeam = true,
  arenaSlug,
  inviteCode,
  onJoin,
  onQuit,
  onResign,
  onLoginRedirect,
  onRequestPrivateJoin,
}: ArenaActionButtonsProps) {
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode && inputCode.trim() !== inviteCode.trim()) {
      setCodeError("Invalid code.");
      return;
    }
    setCodeError("");
    onRequestPrivateJoin(inputCode);
  };

  if (isHost) {
    return (
      <button className="w-full py-3 px-4 bg-[#0E0E0D] hover:bg-white hover:text-[#0E0E0D] text-[#F1EFE9] font-mono text-[0.68rem] uppercase tracking-[0.2em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
        EDIT ARENA
      </button>
    );
  }

  if (isJoined) {
    if (isCompleted) {
      return (
        <button
          disabled
          className="w-full py-3 px-4 bg-[#0E0E0D]/60 text-white/50 font-mono text-[0.68rem] uppercase tracking-[0.2em] font-bold border-2 border-white/10 cursor-not-allowed"
        >
          ARENA COMPLETED
        </button>
      );
    }

    if (isRegistrationPhase) {
      return (
        <button
          onClick={onQuit}
          className="w-full py-3 px-4 bg-[#0E0E0D] hover:bg-red-950 text-[#F1EFE9] hover:text-red-300 font-mono text-[0.68rem] uppercase tracking-[0.2em] font-bold border-2 border-white/30 hover:border-red-500/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>QUIT ARENA</span>
        </button>
      );
    }

    return (
      <button
        onClick={onResign}
        className="w-full py-3 px-4 bg-[#0E0E0D] hover:bg-red-950 text-[#F1EFE9] hover:text-red-300 font-mono text-[0.68rem] uppercase tracking-[0.2em] font-bold border-2 border-white/30 hover:border-red-500/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Flag className="w-3.5 h-3.5 text-red-400" />
        <span>RESIGN</span>
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-[#0E0E0D]/60 text-gray-500 font-mono text-[0.68rem] uppercase tracking-[0.2em] font-bold border-2 border-white/10 cursor-not-allowed"
      >
        ARENA FULL
      </button>
    );
  }

  if (isPrivate && !isGuest) {
    return (
      <form onSubmit={handlePrivateSubmit} className="space-y-2">
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="ENTER INVITE CODE..."
          className="w-full px-3.5 py-2 border-2 border-white/30 font-mono text-xs uppercase bg-[#0E0E0D] text-white focus:outline-none focus:ring-2 focus:ring-orange"
        />
        {codeError && (
          <p className="font-mono text-[0.5rem] text-red-400 font-bold uppercase">{codeError}</p>
        )}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-orange text-white font-mono text-[0.7rem] uppercase tracking-[0.25em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          JOIN
        </button>
      </form>
    );
  }

  // TEAM ARENA: Navigate to Matchmaking Hub (/arena/[id]/teams)
  if (isTeam && arenaSlug) {
    if (isGuest) {
      return (
        <button
          onClick={onLoginRedirect}
          className="w-full py-3 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.25em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center gap-1.5 group cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4 text-white" />
          <span>SIGN IN TO JOIN SQUADS</span>
        </button>
      );
    }

    return (
      <Link
        href={`/arena/${arenaSlug}/teams`}
        className="w-full py-3 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.25em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
      >
        <Gamepad2 className="w-4 h-4 text-white" />
        <span>BROWSE SQUAD LOBBIES</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  // SOLO ARENA: Direct 1-Click Join
  return (
    <button
      onClick={isGuest ? onLoginRedirect : onJoin}
      className="w-full py-3 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.25em] font-bold border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
    >
      <span>JOIN ARENA</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
