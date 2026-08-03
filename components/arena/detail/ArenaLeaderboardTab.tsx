"use client";

import React from "react";
import { Trophy, Code2, Video } from "lucide-react";

export function ArenaLeaderboardTab() {
  const mockLeaderboard = [
    {
      rank: 1,
      teamName: "Cyber_Warriors",
      score: 98.5,
      members: ["@alex_dev", "@sarah_code"],
      repoUrl: "https://github.com/example/cyber-warriors",
      videoUrl: "https://youtube.com/watch?v=1",
      badge: "1ST PLACE",
    },
    {
      rank: 2,
      teamName: "Algo_Titans",
      score: 94.2,
      members: ["@john_hacks", "@emma_ui"],
      repoUrl: "https://github.com/example/algo-titans",
      videoUrl: "https://youtube.com/watch?v=2",
      badge: "2ND PLACE",
    },
    {
      rank: 3,
      teamName: "Prisma_Pirates",
      score: 89.0,
      members: ["@dev_dave"],
      repoUrl: "https://github.com/example/prisma-pirates",
      videoUrl: "https://youtube.com/watch?v=3",
      badge: "3RD PLACE",
    },
  ];

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-4 space-y-4">
      <div className="border-b border-[#0E0E0D]/10 pb-3">
        <div className="flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.15em] text-amber-600 font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>ARENA LEADERBOARD</span>
        </div>
        <p className="font-mono text-[0.48rem] text-[#0E0E0D]/60 uppercase tracking-widest mt-0.5">
          Official judge evaluations &amp; scores.
        </p>
      </div>

      <div className="space-y-2.5">
        {mockLeaderboard.map((item) => (
          <div
            key={item.rank}
            className={`p-3 border-2 flex items-center justify-between gap-2 transition-all ${
              item.rank === 1
                ? "bg-amber-50/50 border-amber-500 shadow-[2px_2px_0px_0px_#F59E0B]"
                : "bg-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 border-2 font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                  item.rank === 1
                    ? "bg-amber-500 text-white border-amber-700"
                    : item.rank === 2
                    ? "bg-slate-300 text-slate-800 border-slate-500"
                    : "bg-amber-800 text-amber-100 border-amber-900"
                }`}
              >
                #{item.rank}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E0D] truncate">
                    {item.teamName}
                  </h4>
                  <span className="font-mono text-[0.45rem] font-bold uppercase px-1 py-0.2 bg-amber-100 text-amber-900 border border-amber-400 shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="font-mono text-[0.48rem] text-[#0E0E0D]/60 uppercase truncate">
                  {item.members.join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs font-bold text-orange">{item.score}</span>

              <div className="flex items-center gap-1">
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 border border-[#0E0E0D] bg-white hover:bg-gray-100 text-[#0E0E0D]"
                  title="View GitHub Repo"
                >
                  <Code2 className="w-3 h-3" />
                </a>
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 border border-[#0E0E0D] bg-white hover:bg-gray-100 text-[#0E0E0D]"
                  title="Watch Video Demo"
                >
                  <Video className="w-3 h-3 text-red-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE PAGINATION BUTTON */}
      <div className="pt-1">
        <button
          type="button"
          className="w-full py-2 bg-[#0E0E0D] hover:bg-orange text-white font-mono text-[0.55rem] uppercase tracking-[0.15em] font-bold border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] transition-colors cursor-pointer"
        >
          LOAD MORE STANDINGS ↓
        </button>
      </div>
    </div>
  );
}

export default ArenaLeaderboardTab;
