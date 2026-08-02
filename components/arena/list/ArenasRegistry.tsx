"use client";

import { Trophy } from "lucide-react";
import { ArenaCard, ArenaCardSkeleton } from "@/components/arena/ArenaCard";
import { ArenasToolbarPagination, ArenasFooterPagination } from "./ArenasPagination";
import type { SerializedArenaListItem } from "@/lib/arena/types";

interface ArenasRegistryProps {
  arenas: SerializedArenaListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  activeTab: "all" | "my";
  isUserLoggedIn: boolean;
}

/** Registry toolbar (result count + pagination) and the arena grid/skeleton/empty states. */
export function ArenasRegistry({
  arenas,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  activeTab,
  isUserLoggedIn,
}: ArenasRegistryProps) {
  return (
    <div className="lg:col-span-9 space-y-6 relative">

      {/* Registry Toolbar Header (Results & Top-Right Pagination) */}
      <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-3.5">
        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground font-bold">
          Registry: {totalCount} Arena(s) Found
        </span>

        <ArenasToolbarPagination
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </div>

      {/* Active Tab Contents */}
      <div>
        {activeTab === "my" && !isUserLoggedIn ? (
          <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-white p-10 text-center space-y-3 shadow-[4px_4px_0px_0px_#0E0E0D]">
            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 stroke-[1.25]" />
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold">Authentication Required</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Sign in to view and track your registered arenas, created hackathons, and live team lobbies.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            {/* Pulsing Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ArenaCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        ) : arenas.length > 0 ? (
          <div className="space-y-6">
            {/* Grid System for Listings: 3 Columns on largest screens (xl) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {arenas.map((arena) => (
                <ArenaCard key={arena.id} arena={arena} />
              ))}
            </div>

            {/* Registry Pagination (Bottom Backup) */}
            <ArenasFooterPagination
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#0E0E0D]/20 bg-white p-12 text-center space-y-2 shadow-[4px_4px_0px_0px_#0E0E0D]">
            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/30 stroke-[1.25]" />
            <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted-foreground font-bold">
              No matching arenas found in this directory.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default ArenasRegistry;
