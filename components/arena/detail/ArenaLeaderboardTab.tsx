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
      badge: "🥇 1ST PLACE",
    },
    {
      rank: 2,
      teamName: "Algo_Titans",
      score: 94.2,
      members: ["@john_hacks", "@emma_ui"],
      repoUrl: "https://github.com/example/algo-titans",
      videoUrl: "https://youtube.com/watch?v=2",
      badge: "🥈 2ND PLACE",
    },
    {
      rank: 3,
      teamName: "Prisma_Pirates",
      score: 89.0,
      members: ["@dev_dave"],
      repoUrl: "https://github.com/example/prisma-pirates",
      videoUrl: "https://youtube.com/watch?v=3",
      badge: "🥉 3RD PLACE",
    },
  ];

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-amber-600 font-bold">
            <Trophy className="w-4 h-4" />
            <span>ARENA LEADERBOARD & WINNERS</span>
          </div>
          <p className="font-mono text-[0.52rem] text-[#0E0E0D]/60 uppercase tracking-widest mt-0.5">
            Final rankings evaluated by judges upon arena completion.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {mockLeaderboard.map((item) => (
          <div
            key={item.rank}
            className={`p-4 border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              item.rank === 1
                ? "bg-amber-50 border-amber-500 shadow-[3px_3px_0px_0px_#F59E0B]"
                : "bg-white border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 border-2 font-mono text-sm font-bold flex items-center justify-center shrink-0 ${
                  item.rank === 1
                    ? "bg-amber-500 text-white border-amber-700"
                    : item.rank === 2
                    ? "bg-slate-300 text-slate-800 border-slate-500"
                    : "bg-amber-800 text-amber-100 border-amber-900"
                }`}
              >
                #{item.rank}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#0E0E0D]">
                    {item.teamName}
                  </h4>
                  <span className="font-mono text-[0.52rem] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400">
                    {item.badge}
                  </span>
                </div>
                <p className="font-mono text-[0.55rem] text-[#0E0E0D]/60 uppercase">
                  Members: {item.members.join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 block">
                  SCORE
                </span>
                <span className="font-mono text-base font-bold text-orange">{item.score} / 100</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-[#0E0E0D] bg-white hover:bg-gray-100 text-[#0E0E0D]"
                  title="View GitHub Repo"
                >
                  <Code2 className="w-4 h-4" />
                </a>
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-[#0E0E0D] bg-white hover:bg-gray-100 text-[#0E0E0D]"
                  title="Watch Video Demo"
                >
                  <Video className="w-4 h-4 text-red-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE PAGINATION BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          className="w-full py-2.5 bg-[#0E0E0D] hover:bg-orange text-white font-mono text-[0.62rem] uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] transition-colors cursor-pointer"
        >
          LOAD MORE STANDINGS ↓
        </button>
      </div>
    </div>
  );
}

export default ArenaLeaderboardTab;
