"use client";

import React, { useState } from "react";
import { Trophy, Code2, Video, CheckCircle2 } from "lucide-react";

interface LeaderboardItem {
  rank: number;
  teamName: string;
  score: number;
  members: string[];
  repoUrl: string;
  videoUrl: string;
  badge?: string;
}

const FULL_MOCK_LEADERBOARD: LeaderboardItem[] = [
  {
    rank: 1,
    teamName: "Cyber_Warriors",
    score: 98.5,
    members: ["@alex_dev", "@sarah_c"],
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
  {
    rank: 4,
    teamName: "Quantum_Coders",
    score: 86.4,
    members: ["@marcus_ai", "@vector_dev"],
    repoUrl: "https://github.com/example/quantum-coders",
    videoUrl: "https://youtube.com/watch?v=4",
  },
  {
    rank: 5,
    teamName: "Zero_Day_Guild",
    score: 83.1,
    members: ["@elena_ui", "@sam_sec"],
    repoUrl: "https://github.com/example/zero-day-guild",
    videoUrl: "https://youtube.com/watch?v=5",
  },
  {
    rank: 6,
    teamName: "Matrix_Architects",
    score: 81.7,
    members: ["@neo_dev", "@trinity_c"],
    repoUrl: "https://github.com/example/matrix-architects",
    videoUrl: "https://youtube.com/watch?v=6",
  },
  {
    rank: 7,
    teamName: "Rust_Crusaders",
    score: 79.8,
    members: ["@ferris_r", "@tokio_dev"],
    repoUrl: "https://github.com/example/rust-crusaders",
    videoUrl: "https://youtube.com/watch?v=7",
  },
  {
    rank: 8,
    teamName: "Neural_Ninjas",
    score: 76.5,
    members: ["@pytorch_pro", "@jax_coder"],
    repoUrl: "https://github.com/example/neural-ninjas",
    videoUrl: "https://youtube.com/watch?v=8",
  },
  {
    rank: 9,
    teamName: "Async_Devs",
    score: 74.0,
    members: ["@await_me", "@promise_all"],
    repoUrl: "https://github.com/example/async-devs",
    videoUrl: "https://youtube.com/watch?v=9",
  },
  {
    rank: 10,
    teamName: "Binary_Beasts",
    score: 71.2,
    members: ["@byte_master", "@bit_shifter"],
    repoUrl: "https://github.com/example/binary-beasts",
    videoUrl: "https://youtube.com/watch?v=10",
  },
  {
    rank: 11,
    teamName: "Docker_Dragons",
    score: 68.9,
    members: ["@k8s_king", "@container_dev"],
    repoUrl: "https://github.com/example/docker-dragons",
    videoUrl: "https://youtube.com/watch?v=11",
  },
  {
    rank: 12,
    teamName: "Vim_Wizards",
    score: 65.4,
    members: ["@hjkl_master", "@neovim_pro"],
    repoUrl: "https://github.com/example/vim-wizards",
    videoUrl: "https://youtube.com/watch?v=12",
  },
];

export function ArenaLeaderboardTab() {
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const displayedItems = FULL_MOCK_LEADERBOARD.slice(0, visibleCount);
  const hasMore = visibleCount < FULL_MOCK_LEADERBOARD.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, FULL_MOCK_LEADERBOARD.length));
  };

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-4 space-y-4">
      <div className="border-b border-[#0E0E0D]/10 pb-3 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.15em] text-amber-600 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>ARENA LEADERBOARD</span>
          </div>
          <p className="font-mono text-[0.48rem] text-[#0E0E0D]/60 uppercase tracking-widest mt-0.5">
            Official judge evaluations &amp; scores.
          </p>
        </div>

        <span className="font-mono text-[0.48rem] font-bold uppercase px-2 py-0.5 bg-[#0E0E0D]/5 text-[#0E0E0D]/70 border border-[#0E0E0D]/20">
          SHOWING {displayedItems.length} OF {FULL_MOCK_LEADERBOARD.length}
        </span>
      </div>

      {/* SCROLL CONTAINER WITH FIXED MAX HEIGHT TO PREVENT LAYOUT SHIFT (CLS FIX) */}
      <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {displayedItems.map((item) => (
          <div
            key={item.rank}
            className={`p-2.5 border-2 flex items-center justify-between gap-2 transition-all ${
              item.rank === 1
                ? "bg-amber-50/50 border-amber-500 shadow-[2px_2px_0px_0px_#F59E0B]"
                : item.rank === 2
                ? "bg-slate-50 border-slate-400 shadow-[2px_2px_0px_0px_#94A3B8]"
                : item.rank === 3
                ? "bg-amber-900/5 border-amber-800/40 shadow-[2px_2px_0px_0px_#78350F]"
                : "bg-white border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D]"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-6 h-6 border-2 font-mono text-[0.62rem] font-bold flex items-center justify-center shrink-0 ${
                  item.rank === 1
                    ? "bg-amber-500 text-white border-amber-700"
                    : item.rank === 2
                    ? "bg-slate-300 text-slate-800 border-slate-500"
                    : item.rank === 3
                    ? "bg-amber-800 text-amber-100 border-amber-900"
                    : "bg-[#0E0E0D]/10 text-[#0E0E0D] border-[#0E0E0D]/30"
                }`}
              >
                #{item.rank}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-mono text-[0.68rem] font-bold uppercase tracking-wider text-[#0E0E0D] truncate">
                    {item.teamName}
                  </h4>
                  {item.badge && (
                    <span className="font-mono text-[0.45rem] font-bold uppercase px-1 py-0.2 bg-amber-100 text-amber-900 border border-amber-400 shrink-0">
                      {item.badge}
                    </span>
                  )}
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

      {/* LOAD MORE / FULLY LOADED BUTTON */}
      <div className="pt-1">
        {hasMore ? (
          <button
            type="button"
            onClick={handleLoadMore}
            className="w-full py-2 bg-[#0E0E0D] hover:bg-orange text-white font-mono text-[0.55rem] uppercase tracking-[0.15em] font-bold border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] transition-colors cursor-pointer"
          >
            LOAD MORE STANDINGS ({FULL_MOCK_LEADERBOARD.length - visibleCount} REMAINING) ↓
          </button>
        ) : (
          <div className="w-full py-2 bg-emerald-50 text-emerald-800 font-mono text-[0.52rem] uppercase tracking-widest font-bold border border-emerald-300 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ALL {FULL_MOCK_LEADERBOARD.length} STANDINGS LOADED</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArenaLeaderboardTab;
