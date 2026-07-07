"use client";

import React, { useState } from "react";
import { Trophy, Shield } from "lucide-react";

interface BillboardContest {
  id: string;
  title: string;
  isPrivate: boolean;
  status: string;
  participantCount: number;
}

interface CairoBillboardProps {
  contests: BillboardContest[];
}

export function CairoBillboard({ contests }: CairoBillboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // small count for layout elegance, but fully paginated

  // Paginated list calculation
  const totalPages = Math.ceil(contests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContests = contests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="border-2 border-[#0E0E0D] bg-[#FAF8F5] p-5 shadow-[4px_4px_0px_0px_#0E0E0D] relative flex flex-col h-full justify-between">
      
      {/* Decorative inner borders */}
      <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
      <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="border-b-2 border-double border-[#0E0E0D] pb-3 text-left">
          <span className="font-mono text-[0.45rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
            [STANDINGS / LEADBOARD]
          </span>
          <h2 className="font-display italic text-2xl uppercase tracking-tight text-[#0E0E0D]">
            Cairo Billboard
          </h2>
          <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">
            Top active arenas sorted by developer deployments.
          </p>
        </div>

        {/* Board Table */}
        <div className="space-y-2 text-left">
          {paginatedContests.length > 0 ? (
            paginatedContests.map((contest, index) => {
              const globalIndex = startIndex + index + 1;
              const rankStr = globalIndex.toString().padStart(2, "0");
              return (
                <div 
                  key={contest.id} 
                  className="flex items-center justify-between border-b border-[#0E0E0D]/10 py-2.5 font-mono text-[0.62rem]"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-bold text-orange">#{rankStr}</span>
                    <span className="font-sans font-medium text-[#0E0E0D] uppercase truncate max-w-[140px]">
                      {contest.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-[#E4E1D9] text-[#0E0E0D] px-1 py-0.5 border border-border">
                      {contest.participantCount} DEVS
                    </span>
                    {contest.isPrivate ? (
                      <Shield className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Trophy className="h-3 w-3 text-orange" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center font-mono text-muted-foreground uppercase text-[0.55rem] tracking-wider">
              No active arenas reported
            </div>
          )}
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-dashed border-[#0E0E0D]/20 mt-4 relative z-10">
          <span className="font-mono text-[0.55rem] text-muted-foreground tracking-wider uppercase">
            PAGE {currentPage} OF {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 border border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors flex items-center justify-center font-mono font-bold text-xs"
            >
              [←]
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 border border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors flex items-center justify-center font-mono font-bold text-xs"
            >
              [→]
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default CairoBillboard;
