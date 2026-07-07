"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Users, Trophy, ExternalLink } from "lucide-react";

export interface ContestCardProps {
  contest: {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string | null;
    status: string;
    isPrivate: boolean;
    isTeam: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    maxParticipants?: number | null;
    registrationStart: string;
    registrationEnd: string;
    ideaPhaseStart: string;
    ideaPhaseEnd: string;
    implPhaseStart: string;
    implPhaseEnd: string;
    requireGithubUrl: boolean;
    requireFigmaUrl: boolean;
    requireVideoUrl: boolean;
    requireWriteup: boolean;
    rulesText: string;
    _count?: {
      teams: number;
    };
  };
}

export function ContestCard({ contest }: ContestCardProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let targetTime = 0;
      let label = "";

      if (contest.status === "REGISTRATION_OPEN") {
        targetTime = new Date(contest.registrationEnd).getTime();
        label = "Reg Closes In";
      } else if (contest.status === "IMPLEMENTATION_PHASE" || contest.status === "IDEA_PHASE") {
        targetTime = new Date(contest.implPhaseEnd).getTime();
        label = "Ends In";
      } else {
        setTimeLeft("COMPLETED");
        return;
      }

      const difference = targetTime - now;
      if (difference <= 0) {
        setTimeLeft("CLOSED");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${label}: ${days}d ${hours}h`);
      } else {
        setTimeLeft(`${label}: ${hours}h ${minutes}m`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [contest]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IMPLEMENTATION_PHASE":
      case "IDEA_PHASE":
        return "bg-green-100 text-green-900 border-green-300";
      case "REGISTRATION_OPEN":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-300";
    }
  };

  const formattedStatus = contest.status.replace("_", " ");

  return (
    <Link
      href={`/contest/${contest.id}`}
      className="group block bg-[#FAF8F5] text-[#0E0E0D] border-2 border-[#0E0E0D] p-4 relative shadow-[4px_4px_0px_0px_#0E0E0D] hover:shadow-[6px_6px_0px_0px_#0E0E0D] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex flex-col md:flex-row gap-5">
        
        {/* Cover Image Block */}
        <div className="w-full md:w-44 h-28 relative border border-[#0E0E0D]/10 bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
          {contest.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contest.coverImageUrl}
              alt={contest.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center select-none text-[#0E0E0D]/20">
              <Trophy className="h-8 w-8 stroke-[1.25]" />
              <span className="font-mono text-[0.45rem] tracking-[0.2em] uppercase mt-1">NO COVER</span>
            </div>
          )}
          
          {/* Cover Overlay status tag */}
          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
            <span className="font-mono text-[0.42rem] font-bold uppercase tracking-wider bg-orange text-white px-1 py-0.5 border border-[#0E0E0D]">
              {contest.isPrivate ? "INVITE ONLY" : "PUBLIC"}
            </span>
          </div>
        </div>

        {/* Card Main Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`font-mono text-[0.48rem] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${getStatusColor(contest.status)}`}>
                [{formattedStatus}]
              </span>
              {timeLeft && (
                <span className="font-mono text-[0.48rem] font-bold uppercase tracking-widest text-[#0E0E0D]/60">
                  {timeLeft}
                </span>
              )}
            </div>

            <h3 className="font-display italic text-lg md:text-xl font-normal leading-tight text-[#0E0E0D] uppercase group-hover:text-accent transition-colors duration-200 truncate">
              {contest.title}
            </h3>

            <p className="font-sans text-xs text-muted-foreground line-clamp-2 mt-1 normal-case">
              {contest.description}
            </p>
          </div>

          {/* Footer Details */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-dashed border-[#0E0E0D]/10">
            <div className="flex items-center gap-3 font-mono text-[0.52rem] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {contest.isTeam ? `Squad: ${contest.minTeamSize}-${contest.maxTeamSize} Devs` : "Solo Arena"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(contest.implPhaseStart).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-1.5">
              {contest.requireGithubUrl && (
                <span className="font-mono text-[0.45rem] font-bold text-[#0E0E0D] bg-secondary border border-border px-1 py-0.5">
                  [GITHUB]
                </span>
              )}
              {contest.requireFigmaUrl && (
                <span className="font-mono text-[0.45rem] font-bold text-[#0E0E0D] bg-secondary border border-border px-1 py-0.5">
                  [FIGMA]
                </span>
              )}
              <span className="font-mono text-[0.48rem] text-accent font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                ENTER <ExternalLink className="h-2 w-2" />
              </span>
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
}

export default ContestCard;
