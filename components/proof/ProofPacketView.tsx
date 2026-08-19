"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  ExternalLink,
  Copy,
  Check,
  Download,
} from "lucide-react";
import type { ProofPacketSnapshot } from "@/lib/proof/proof-service";

interface ProofPacketViewProps {
  slug: string;
  contentHash: string;
  issuedAt: string;
  isRevoked: boolean;
  revocationReason?: string | null;
  isCryptographicallyValid: boolean;
  snapshot: ProofPacketSnapshot;
}

export function ProofPacketView({
  slug,
  contentHash,
  issuedAt,
  isRevoked,
  revocationReason,
  isCryptographicallyValid,
  snapshot,
}: ProofPacketViewProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(contentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proof-packet-${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Verification Header Banner */}
      <div className="border-2 border-foreground bg-white shadow-[6px_6px_0px_0px_var(--foreground)] p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-foreground pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[0.62rem] text-orange font-bold uppercase tracking-[0.25em]">
              <ShieldCheck className="w-4 h-4 text-orange" />
              <span>DEVS ARENA — TAMPER-EVIDENT CREDENTIAL</span>
            </div>
            <h1 className="font-display italic text-2xl md:text-3xl uppercase tracking-tight text-foreground">
              Proof Packet #{slug}
            </h1>
          </div>

          <div>
            {isRevoked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-900 border-2 border-red-500 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                REVOKED CREDENTIAL
              </span>
            ) : isCryptographicallyValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-900 border-2 border-green-600 font-mono text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                [✓] CRYPTOGRAPHICALLY VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-900 border-2 border-red-500 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                HASH INTEGRITY MISMATCH
              </span>
            )}
          </div>
        </div>

        {/* SHA256 Content Hash Block */}
        <div className="bg-secondary/40 border border-foreground/20 p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[0.58rem] uppercase tracking-wider">
            <span>Canonical SHA-256 Content Hash</span>
            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1 text-foreground hover:text-orange transition-colors"
            >
              {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? "COPIED" : "COPY HASH"}</span>
            </button>
          </div>
          <p className="font-mono text-xs md:text-sm font-bold text-foreground break-all select-all">
            {contentHash}
          </p>
        </div>

        {isRevoked && revocationReason && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 font-mono text-xs">
            <strong>Revocation Reason:</strong> {revocationReason}
          </div>
        )}
      </div>

      {/* Grid: Competition & Entrant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Arena Summary */}
        <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 space-y-4">
          <h2 className="font-mono text-[0.65rem] text-orange font-bold uppercase tracking-[0.2em] border-b border-foreground/10 pb-2">
            COMPETITION CONTEXT
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase block">Arena Title</span>
              <span className="font-mono text-base font-bold text-foreground">{snapshot.arena.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <span className="text-[0.55rem] text-muted-foreground uppercase block">Domain</span>
                <span className="font-bold">{snapshot.arena.domain}</span>
              </div>
              <div>
                <span className="text-[0.55rem] text-muted-foreground uppercase block">Difficulty</span>
                <span className="font-bold">{snapshot.arena.difficulty}</span>
              </div>
              <div>
                <span className="text-[0.55rem] text-muted-foreground uppercase block">Format</span>
                <span className="font-bold">{snapshot.arena.difficulty}</span>
              </div>
              <div>
                <span className="text-[0.55rem] text-muted-foreground uppercase block">Issued At</span>
                <span className="font-bold">{new Date(issuedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entrant Profile */}
        <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 space-y-4">
          <h2 className="font-mono text-[0.65rem] text-orange font-bold uppercase tracking-[0.2em] border-b border-foreground/10 pb-2">
            CREDENTIAL HOLDER
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase block">
                {snapshot.entrant.isTeam ? "Squad Name" : "Developer"}
              </span>
              <span className="font-mono text-base font-bold text-foreground">
                {snapshot.entrant.teamName || snapshot.entrant.members[0]?.fullName || `@${snapshot.entrant.members[0]?.handle}`}
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase block">Team Members</span>
              <div className="flex flex-wrap gap-2">
                {snapshot.entrant.members.map((m) => (
                  <Link
                    key={m.id}
                    href={`/profile/${m.handle}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary border border-foreground/20 font-mono text-xs font-bold text-foreground hover:border-orange transition-colors"
                  >
                    <span>{m.fullName || `@${m.handle}`}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation & Rubric Scores */}
      <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
          <h2 className="font-mono text-[0.65rem] text-orange font-bold uppercase tracking-[0.2em]">
            VERIFIED EVALUATION &amp; RUBRIC BREAKDOWN
          </h2>
          {snapshot.evaluation.finalScore !== null && (
            <span className="font-mono text-sm font-bold bg-foreground text-background px-3 py-1 border border-foreground">
              SCORE: {snapshot.evaluation.finalScore} / 10.0
            </span>
          )}
        </div>

        <div className="space-y-6">
          {snapshot.evaluation.verdicts.map((v, vIdx) => (
            <div key={vIdx} className="space-y-4 border border-foreground/15 p-4 bg-secondary/10">
              <div className="flex items-center justify-between font-mono text-xs font-bold border-b border-foreground/10 pb-2">
                <span>Judge Verdict #{vIdx + 1}</span>
                <span className="text-orange">Score: {v.finalScore}</span>
              </div>

              {v.feedbackText && (
                <p className="font-sans text-xs italic text-foreground/80 bg-white p-3 border border-foreground/10">
                  &ldquo;{v.feedbackText}&rdquo;
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {v.scores.map((s, sIdx) => (
                  <div key={sIdx} className="bg-white border border-foreground/10 p-3 space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="font-bold">{s.criterionTitle}</span>
                      <span className="text-orange font-bold">{s.score}</span>
                    </div>
                    <p className="font-sans text-[0.7rem] text-muted-foreground leading-relaxed">
                      {s.justification}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverables & Git Evidence */}
      <div className="border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] p-6 md:p-8 space-y-6">
        <h2 className="font-mono text-[0.65rem] text-orange font-bold uppercase tracking-[0.2em] border-b border-foreground/10 pb-3">
          VERIFIABLE ARTIFACTS &amp; GIT COMMITS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {snapshot.deliverables.githubUrl && (
            <a
              href={snapshot.deliverables.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary/30 border border-foreground/20 hover:border-foreground flex items-center justify-between font-mono text-xs font-bold transition-colors"
            >
              <span>[GITHUB REPO]</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {snapshot.deliverables.figmaUrl && (
            <a
              href={snapshot.deliverables.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary/30 border border-foreground/20 hover:border-foreground flex items-center justify-between font-mono text-xs font-bold transition-colors"
            >
              <span>[FIGMA SPECS]</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {snapshot.deliverables.videoUrl && (
            <a
              href={snapshot.deliverables.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary/30 border border-foreground/20 hover:border-foreground flex items-center justify-between font-mono text-xs font-bold transition-colors"
            >
              <span>[DEFENSE VIDEO]</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Technical Writeup */}
        <div className="space-y-2 pt-2">
          <span className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-wider block">
            Technical Architecture Writeup
          </span>
          <div className="bg-secondary/20 border border-foreground/10 p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap">
            {snapshot.deliverables.writeupText}
          </div>
        </div>

        {/* Commit Log */}
        {snapshot.commits.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-wider block">
              Verified Commit Log ({snapshot.commits.length} commits)
            </span>
            <div className="border border-foreground/10 divide-y divide-foreground/10 max-h-60 overflow-y-auto font-mono text-xs">
              {snapshot.commits.map((c) => (
                <div key={c.sha} className="p-2.5 flex items-center justify-between bg-white hover:bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-3.5 h-3.5 text-orange shrink-0" />
                    <span className="font-bold">{c.sha.substring(0, 7)}</span>
                    <span className="text-foreground/80 truncate max-w-md">{c.message || "Commit"}</span>
                  </div>
                  <span className="text-[0.6rem] text-muted-foreground shrink-0">
                    {new Date(c.committedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON Payload Export Footer */}
      <div className="border-2 border-foreground bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-muted-foreground">
          Canonical Snapshot Export &bull; Version {snapshot.version}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 bg-secondary border border-foreground font-mono text-xs font-bold hover:bg-foreground hover:text-background transition-colors flex items-center gap-1.5"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? "COPIED JSON" : "COPY JSON"}</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 bg-foreground text-background font-mono text-xs font-bold hover:bg-[#1f1f1d] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD .JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
