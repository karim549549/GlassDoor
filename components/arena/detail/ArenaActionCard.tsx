"use client";

import React, { useState } from "react";
import { Users, Lock, Globe, UserCheck, Shield, AlertCircle, ArrowRight, UserPlus } from "lucide-react";

export type PrototypeUserRole = "guest" | "user_not_joined" | "participant" | "host";

interface ArenaActionCardProps {
  isPrivate: boolean;
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxParticipants: number | null;
  totalParticipants: number;
  status: string;
  inviteCode?: string | null;
  // Prototype state controls
  currentUserRole: PrototypeUserRole;
  onChangeUserRole: (role: PrototypeUserRole) => void;
  onJoinSolo: () => void;
  onOpenTeamModal: () => void;
  onRequestPrivateJoin: (code?: string) => void;
  onGoToSubmission: () => void;
  onLoginRedirect: () => void;
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
  currentUserRole,
  onChangeUserRole,
  onJoinSolo,
  onOpenTeamModal,
  onRequestPrivateJoin,
  onGoToSubmission,
  onLoginRedirect,
}: ArenaActionCardProps) {
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const isFull = maxParticipants !== null && totalParticipants >= maxParticipants;
  const isClosed = status === "COMPLETED";

  const capacityPercentage = maxParticipants
    ? Math.min(100, Math.round((totalParticipants / maxParticipants) * 100))
    : 0;

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode && inputCode.trim() !== inviteCode.trim()) {
      setCodeError("Invalid invitation code. Please check and try again.");
      return;
    }
    setCodeError("");
    onRequestPrivateJoin(inputCode);
  };

  return (
    <div className="w-full bg-white text-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] p-5 space-y-5">
      {/* PROTOTYPE TESTING TOOLBAR */}
      <div className="bg-[#0E0E0D]/5 border border-[#0E0E0D]/15 p-2.5 space-y-1.5">
        <div className="flex justify-between items-center font-mono text-[0.5rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold">
          <span>PROTOTYPE ROLE SWITCHER:</span>
          <span className="text-orange">CLICK TO TEST UI</span>
        </div>
        <div className="grid grid-cols-2 gap-1 font-mono text-[0.55rem]">
          <button
            onClick={() => onChangeUserRole("guest")}
            className={`py-1 px-1.5 border text-center transition-all ${
              currentUserRole === "guest"
                ? "bg-[#0E0E0D] text-white border-[#0E0E0D]"
                : "bg-white text-[#0E0E0D] border-[#0E0E0D]/20 hover:border-[#0E0E0D]"
            }`}
          >
            Guest
          </button>
          <button
            onClick={() => onChangeUserRole("user_not_joined")}
            className={`py-1 px-1.5 border text-center transition-all ${
              currentUserRole === "user_not_joined"
                ? "bg-[#0E0E0D] text-white border-[#0E0E0D]"
                : "bg-white text-[#0E0E0D] border-[#0E0E0D]/20 hover:border-[#0E0E0D]"
            }`}
          >
            User (Not Joined)
          </button>
          <button
            onClick={() => onChangeUserRole("participant")}
            className={`py-1 px-1.5 border text-center transition-all ${
              currentUserRole === "participant"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-white text-[#0E0E0D] border-[#0E0E0D]/20 hover:border-[#0E0E0D]"
            }`}
          >
            Joined Participant
          </button>
          <button
            onClick={() => onChangeUserRole("host")}
            className={`py-1 px-1.5 border text-center transition-all ${
              currentUserRole === "host"
                ? "bg-amber-600 text-white border-amber-700"
                : "bg-white text-[#0E0E0D] border-[#0E0E0D]/20 hover:border-[#0E0E0D]"
            }`}
          >
            Arena Host
          </button>
        </div>
      </div>

      {/* Visibility & Format Badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider border ${
            isPrivate
              ? "bg-amber-100 text-amber-900 border-amber-400"
              : "bg-emerald-100 text-emerald-900 border-emerald-400"
          }`}
        >
          {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {isPrivate ? "PRIVATE ARENA" : "PUBLIC ARENA"}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider bg-[#0E0E0D]/5 border border-[#0E0E0D]/20 text-[#0E0E0D]">
          <Users className="w-3 h-3 text-orange" />
          {isTeam ? `TEAM (${minTeamSize}-${maxTeamSize})` : "SOLO ARENA"}
        </span>
      </div>

      {/* Capacity Counter & Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center font-mono text-[0.6rem] uppercase tracking-wider font-bold text-[#0E0E0D]">
          <span>ARENA CAPACITY</span>
          <span className="text-orange">
            {totalParticipants} / {maxParticipants ?? "∞"} PLACES
          </span>
        </div>
        {maxParticipants && (
          <div className="w-full h-3 bg-[#0E0E0D]/10 border border-[#0E0E0D]/30 p-0.5">
            <div
              className={`h-full transition-all duration-500 ${
                isFull ? "bg-red-500" : "bg-orange"
              }`}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        )}
        <p className="font-mono text-[0.52rem] text-[#0E0E0D]/60 uppercase tracking-widest">
          {maxParticipants
            ? `${maxParticipants - totalParticipants} remaining open places`
            : "Unlimited participant capacity"}
        </p>
      </div>

      {/* DYNAMIC ACTION BUTTON BASED ON ROLE */}
      <div className="pt-2 border-t border-[#0E0E0D]/10 space-y-3">
        {/* ROLE 1: GUEST */}
        {currentUserRole === "guest" && (
          <div className="space-y-2">
            <button
              onClick={onLoginRedirect}
              className="w-full py-3.5 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.7rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#FF5722] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isPrivate ? "SIGN IN TO REQUEST ACCESS" : "SIGN IN TO JOIN ARENA"}</span>
              <ArrowRight className="w-4 h-4 text-orange group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="font-mono text-[0.52rem] text-center text-[#0E0E0D]/60 uppercase tracking-widest">
              Authentication required before entering this arena
            </p>
          </div>
        )}

        {/* ROLE 2: LOGGED IN USER (NOT JOINED) */}
        {currentUserRole === "user_not_joined" && (
          <div className="space-y-3">
            {isFull ? (
              <div className="p-3 bg-red-50 border border-red-300 text-center font-mono text-[0.6rem] text-red-800 uppercase tracking-wider font-bold space-y-1">
                <AlertCircle className="w-4 h-4 mx-auto text-red-600" />
                <span>ARENA CAPACITY FULL</span>
                <p className="text-[0.5rem] text-red-600 font-normal">
                  All {maxParticipants} places have been claimed.
                </p>
              </div>
            ) : isClosed ? (
              <div className="p-3 bg-gray-100 border border-gray-300 text-center font-mono text-[0.6rem] text-gray-700 uppercase tracking-wider font-bold">
                REGISTRATION CLOSED
              </div>
            ) : isPrivate ? (
              /* Private Arena Code / Request Form */
              <form onSubmit={handlePrivateSubmit} className="space-y-2">
                <label className="block font-mono text-[0.55rem] uppercase tracking-widest text-[#0E0E0D]/70 font-bold">
                  INVITATION CODE REQUIRED:
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="ENTER ACCESS CODE..."
                  className="w-full px-3 py-2 border-2 border-[#0E0E0D] font-mono text-xs text-[#0E0E0D] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-orange"
                />
                {codeError && (
                  <p className="font-mono text-[0.52rem] text-red-600 font-bold uppercase">{codeError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#FF5722] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-orange" />
                  <span>REQUEST TO JOIN PRIVATE ARENA</span>
                </button>
              </form>
            ) : isTeam ? (
              /* Public Team Arena */
              <button
                onClick={onOpenTeamModal}
                className="w-full py-3.5 px-4 bg-orange hover:bg-orange/90 text-white font-mono text-[0.7rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 group"
              >
                <Users className="w-4 h-4" />
                <span>BROWSE TEAM POOLS & JOIN</span>
              </button>
            ) : (
              /* Public Solo Arena */
              <button
                onClick={onJoinSolo}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[0.7rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>JOIN ARENA NOW (SOLO)</span>
              </button>
            )}
          </div>
        )}

        {/* ROLE 3: JOINED PARTICIPANT */}
        {currentUserRole === "participant" && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-center font-mono text-[0.6rem] text-emerald-900 uppercase tracking-wider font-bold flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>YOU ARE PARTICIPATING IN THIS ARENA</span>
            </div>
            <button
              onClick={onGoToSubmission}
              className="w-full py-3 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#10B981] transition-all flex items-center justify-center gap-2"
            >
              <span>GO TO SUBMISSION PORTAL</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        {/* ROLE 4: HOST / OWNER */}
        {currentUserRole === "host" && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border-2 border-amber-500 text-center font-mono text-[0.6rem] text-amber-900 uppercase tracking-wider font-bold flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>YOU ARE THE HOST OF THIS ARENA</span>
            </div>
            <button className="w-full py-2.5 px-4 bg-[#0E0E0D] text-[#F1EFE9] font-mono text-[0.6rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] hover:bg-amber-600 transition-colors">
              EDIT ARENA & SETTINGS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArenaActionCard;
