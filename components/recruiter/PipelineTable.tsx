import React from "react";
import Link from "next/link";
import { ShieldCheck, ShieldOff } from "lucide-react";
import type { PipelineCandidateDto } from "@/lib/recruiter/dto";
import { RATING_DOMAIN_LABELS, type RatingDomainValue } from "@/lib/recruiter/schema";

interface PipelineTableProps {
  candidates: PipelineCandidateDto[];
  /** The domain the list is filtered by, if any — decides which rating column shows. */
  domain?: RatingDomainValue;
}

function candidateName(candidate: PipelineCandidateDto): string {
  return (
    candidate.fullName?.trim() ||
    (candidate.handle ? `@${candidate.handle}` : "Unnamed developer")
  );
}

function domainLabel(domain: string): string {
  return RATING_DOMAIN_LABELS[domain as RatingDomainValue] ?? domain;
}

/**
 * Plain table. The signal is the content — verified rating, arenas completed,
 * top score, and whether a tamper-evident Proof Packet backs it — so nothing
 * here decorates it.
 */
export function PipelineTable({ candidates, domain }: PipelineTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          No candidates yet. Developers appear here once an arena your company
          ran or sponsored has published its results and scored submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--foreground)]">
      <table className="w-full min-w-[52rem] border-collapse text-left">
        <caption className="sr-only">
          Candidates ranked by verified rating, then by top score
        </caption>
        <thead>
          <tr className="border-b-2 border-foreground bg-secondary font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            <th scope="col" className="px-4 py-3">Candidate</th>
            <th scope="col" className="px-4 py-3">
              {domain ? `${domainLabel(domain)} rating` : "Domain rating"}
            </th>
            <th scope="col" className="px-4 py-3">Arenas completed</th>
            <th scope="col" className="px-4 py-3">Top score</th>
            <th scope="col" className="px-4 py-3">Proof packet</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/10 font-mono text-xs">
          {candidates.map((candidate) => (
            <tr key={candidate.userId} className="align-top">
              <td className="px-4 py-3">
                <Link
                  href={`/user/${candidate.userId}`}
                  className="font-bold uppercase text-foreground underline decoration-orange underline-offset-4 hover:text-orange"
                >
                  {candidateName(candidate)}
                </Link>
                <span className="mt-1 block text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                  {[candidate.seniority, candidate.location].filter(Boolean).join(" · ") ||
                    "No public details"}
                </span>
              </td>
              <td className="px-4 py-3">
                {candidate.bestRating === null ? (
                  <span className="text-muted-foreground">Unrated</span>
                ) : (
                  <>
                    <span className="font-bold">{candidate.bestRating}</span>
                    {!domain && candidate.ratings[0] && (
                      <span className="mt-1 block text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                        {domainLabel(candidate.ratings[0].domain)}
                      </span>
                    )}
                    <span className="mt-1 block text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                      ±{candidate.ratings[0]?.deviation ?? 0} deviation
                    </span>
                  </>
                )}
              </td>
              <td className="px-4 py-3">{candidate.arenasCompleted}</td>
              <td className="px-4 py-3">{candidate.topScore}</td>
              <td className="px-4 py-3">
                {candidate.proofPacketSlug ? (
                  <Link
                    href={`/proof/${candidate.proofPacketSlug}`}
                    className="inline-flex items-center gap-1.5 border border-foreground px-2 py-1 text-[0.6rem] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
                  >
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    View packet
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                    <ShieldOff className="h-3 w-3" aria-hidden="true" />
                    None issued
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PipelineTable;
