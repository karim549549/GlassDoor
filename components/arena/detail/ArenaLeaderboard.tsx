"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ShieldCheck, Users } from "lucide-react";
import { logger } from "@/lib/client/logger";

interface LeaderboardStanding {
  submissionId: string;
  rank: number | null;
  entrantName: string;
  isTeam: boolean;
  score: number | null;
  proofPacketSlug: string | null;
}

interface LeaderboardResponse {
  arenaId: string;
  isPublished: boolean;
  resultsPublishedAt: string | null;
  standings: LeaderboardStanding[];
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--foreground)]">
      <div className="flex items-center gap-2 border-b-2 border-foreground px-5 py-3">
        <Trophy className="h-4 w-4 text-orange" />
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-foreground">
          Final Standings
        </h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-6">
      <p className="font-mono text-[0.55rem] uppercase leading-relaxed tracking-widest text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

interface ArenaLeaderboardProps {
  arenaId: string;
}

export function ArenaLeaderboard({ arenaId }: ArenaLeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch(`/api/arena/${arenaId}/leaderboard`);
        const body = await res.json();
        if (!isActive) return;
        if (!res.ok || body.error) {
          setError(body.error || "Could not load the standings.");
          return;
        }
        setData(body as LeaderboardResponse);
      } catch (err) {
        logger.error("Failed to load arena leaderboard", {
          error: err instanceof Error ? err.message : String(err),
        });
        if (isActive) setError("Network error. Could not load the standings.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isActive = false;
    };
  }, [arenaId]);

  if (isLoading) {
    return (
      <Panel>
        <EmptyState message="Loading standings..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <EmptyState message={error} />
      </Panel>
    );
  }

  // Results are withheld until the host publishes them. Anything shown before
  // that would be a provisional ordering presented as a result.
  if (!data || !data.isPublished) {
    return (
      <Panel>
        <EmptyState message="Standings publish after judging closes." />
      </Panel>
    );
  }

  if (data.standings.length === 0) {
    return (
      <Panel>
        <EmptyState message="Results are published, but no submissions were entered for this arena." />
      </Panel>
    );
  }

  return (
    <Panel>
      <ol className="divide-y divide-foreground/10">
        {data.standings.map((standing) => (
          <li
            key={standing.submissionId}
            className="flex items-start justify-between gap-3 px-5 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="font-mono text-sm font-bold text-orange tabular-nums">
                {standing.rank !== null ? `#${standing.rank}` : "—"}
              </span>
              <div className="min-w-0 space-y-1">
                <span className="flex items-center gap-1.5 font-mono text-[0.65rem] font-bold uppercase text-foreground">
                  {standing.isTeam && <Users className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  <span className="truncate">{standing.entrantName}</span>
                </span>
                {standing.proofPacketSlug ? (
                  <Link
                    href={`/proof/${standing.proofPacketSlug}`}
                    className="inline-flex items-center gap-1 font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground hover:text-orange"
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                    <span>[ Proof Packet ]</span>
                  </Link>
                ) : null}
              </div>
            </div>

            <span className="font-mono text-xs font-bold tabular-nums text-foreground">
              {standing.score !== null ? standing.score.toFixed(2) : "UNSCORED"}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export default ArenaLeaderboard;
