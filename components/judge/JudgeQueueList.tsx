import React from "react";
import Link from "next/link";
import { Gavel, Clock } from "lucide-react";

export interface JudgeQueueItem {
  assignmentId: string;
  submissionId: string;
  arenaTitle: string;
  entrantName: string;
  assignedAt: string;
  /** How many criteria this judge has already saved a score for. */
  scoredCriteria: number;
  totalCriteria: number;
}

interface JudgeQueueListProps {
  items: JudgeQueueItem[];
}

/**
 * Plain list of a judge's outstanding assignments. Deliberately unstyled beyond
 * the app's tokens: the polished surface in this product is the Proof Packet,
 * not the console that feeds it.
 */
export function JudgeQueueList({ items }: JudgeQueueListProps) {
  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Your judging queue is empty. Assignments appear here once a host
          assigns you a submission.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y-2 divide-foreground/10 border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--foreground)]">
      {items.map((item) => (
        <li
          key={item.assignmentId}
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.25em] text-orange">
              {item.arenaTitle}
            </span>
            <span className="block font-mono text-sm font-bold uppercase text-foreground">
              {item.entrantName}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              Assigned {new Date(item.assignedAt).toLocaleDateString()}
              <span aria-hidden="true">·</span>
              {item.scoredCriteria}/{item.totalCriteria} criteria scored
            </span>
          </div>

          <Link
            href={`/judge/${item.submissionId}`}
            className="flex shrink-0 items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
          >
            <Gavel className="h-3.5 w-3.5" />
            [ Score submission ]
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default JudgeQueueList;
