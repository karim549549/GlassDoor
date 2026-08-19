import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Award, FileCode, CheckCircle2 } from "lucide-react";
import type { UserArenaEntry } from "../types";

interface ArenaPerformanceRecordProps {
  arenaEntries?: UserArenaEntry[];
}

export const ArenaPerformanceRecord = React.memo(function ArenaPerformanceRecord({
  arenaEntries = [],
}: ArenaPerformanceRecordProps) {
  const proofPackets = arenaEntries
    .filter((e) => e.submission?.proofPacket && !e.submission.proofPacket.isRevoked)
    .map((e) => ({
      arenaTitle: e.arena.title,
      domain: e.arena.domain,
      difficulty: e.arena.difficulty,
      finalScore: e.submission!.finalScore,
      packet: e.submission!.proofPacket!,
      githubUrl: e.submission!.githubUrl,
    }));

  // Activity Heatmap: Generate 52 weeks (364 days) punch card representation
  const weeks = 28;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;
  
  // Mark days with submission dates as active
  const submissionTimestamps = new Set(
    arenaEntries
      .filter((e) => e.submission?.createdAt)
      .map((e) => new Date(e.submission!.createdAt).toDateString())
  );

  const now = new Date();
  const calendarCells = Array.from({ length: totalDays }).map((_, i) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - (totalDays - 1 - i));
    const isSubmitted = submissionTimestamps.has(dayDate.toDateString());
    return {
      date: dayDate,
      active: isSubmitted,
    };
  });

  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--foreground)] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-orange" />
            <h3 className="font-bold text-base text-foreground">
              Proof Credentials &amp; Competition Ledger
            </h3>
          </div>
          <p className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest">
            Cryptographically sealed contest outcomes, rubric scorecards, and verifiable work.
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-orange">
          {proofPackets.length} VERIFIED {proofPackets.length === 1 ? "PACKET" : "PACKETS"}
        </span>
      </div>

      {/* Verified Proof Packets Grid */}
      <div className="space-y-3">
        <span className="text-foreground text-xs font-bold uppercase tracking-wider block">
          [01 / VERIFIED PROOF PACKETS]
        </span>

        {proofPackets.length === 0 ? (
          <div className="p-6 bg-secondary/30 border border-foreground/20 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="font-mono text-xs font-bold text-foreground">
              NO ISSUED PROOF PACKETS YET
            </p>
            <p className="font-sans text-xs text-muted-foreground lowercase">
              Participate in an official or company arena to earn tamper-evident credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proofPackets.map((item) => (
              <div
                key={item.packet.slug}
                className="border-2 border-foreground bg-white p-5 shadow-[3px_3px_0px_0px_var(--foreground)] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-mono text-[0.58rem] font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
                      <CheckCircle2 className="w-3 h-3" />
                      [✓] SEALED #{item.packet.slug}
                    </span>
                    {item.finalScore !== null && (
                      <span className="font-mono text-xs font-bold bg-foreground text-background px-2 py-0.5">
                        SCORE: {item.finalScore} / 10
                      </span>
                    )}
                  </div>

                  <h4 className="font-mono text-sm font-bold text-foreground">
                    {item.arenaTitle}
                  </h4>

                  <div className="flex gap-2 font-mono text-[0.58rem] text-muted-foreground">
                    <span className="bg-secondary px-2 py-0.5 border border-foreground/10">
                      {item.domain.replace(/_/g, " ")}
                    </span>
                    <span className="bg-secondary px-2 py-0.5 border border-foreground/10">
                      {item.difficulty}
                    </span>
                  </div>

                  <p className="font-mono text-[0.52rem] text-muted-foreground/70 break-all">
                    SHA-256: {item.packet.contentHash.substring(0, 24)}...
                  </p>
                </div>

                <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
                  <span className="text-[0.55rem] text-muted-foreground">
                    Issued {new Date(item.packet.issuedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/proof/${item.packet.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background font-mono text-[0.6rem] font-bold hover:bg-orange transition-colors"
                  >
                    <span>VIEW CREDENTIAL</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Heatmap Grid */}
      <div className="space-y-3 pt-4 border-t border-foreground/15">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-xs font-bold uppercase tracking-wider block">
            [02 / COMPETITION &amp; BUILD ACTIVITY]
          </span>
          <div className="flex items-center gap-2 font-mono text-[0.55rem] text-muted-foreground">
            <span>LESS</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 bg-secondary/80 border border-foreground/10" />
              <span className="w-2.5 h-2.5 bg-orange/40 border border-foreground/10" />
              <span className="w-2.5 h-2.5 bg-orange border border-foreground/10" />
            </div>
            <span>MORE</span>
          </div>
        </div>

        <div className="bg-secondary/20 border border-foreground/15 p-4 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[500px]">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                title={cell.date.toLocaleDateString()}
                className={`w-3 h-3 rounded-[1px] transition-colors ${
                  cell.active
                    ? "bg-orange border border-foreground/40"
                    : "bg-secondary hover:bg-foreground/10 border border-foreground/5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arena History Table */}
      {arenaEntries.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-foreground/15">
          <span className="text-foreground text-xs font-bold uppercase tracking-wider block">
            [03 / ARENA SPRINT HISTORY ({arenaEntries.length})]
          </span>

          <div className="border-2 border-foreground divide-y divide-foreground/10 overflow-hidden">
            {arenaEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-white hover:bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {entry.arena.title}
                    </span>
                    <span className="font-mono text-[0.55rem] px-1.5 py-0.5 bg-secondary border border-foreground/10">
                      {entry.arena.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.58rem] text-muted-foreground">
                    <span>Domain: {entry.arena.domain.replace(/_/g, " ")}</span>
                    <span>&bull;</span>
                    <span>Joined: {new Date(entry.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {entry.submission ? (
                    <span className="font-mono text-xs font-bold text-orange">
                      {entry.submission.finalScore !== null
                        ? `SCORE: ${entry.submission.finalScore}`
                        : "SCORED / PENDING PUBLISH"}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      NO SUBMISSION
                    </span>
                  )}
                  {entry.submission?.githubUrl && (
                    <a
                      href={entry.submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-secondary border border-foreground/20 hover:border-foreground transition-colors"
                      title="GitHub Repository"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
