import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/server/auth/require-user";
import { getJudgeAssignments } from "@/lib/arena/judging-service";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { Footer } from "@/components/home/Footer";
import { JudgeQueueList, type JudgeQueueItem } from "@/components/judge/JudgeQueueList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Judging Queue | Devs Arena",
  robots: { index: false, follow: false },
};

function entrantNameOf(entry: {
  team: { name: string } | null;
  user: { fullName: string | null; handle: string | null } | null;
}): string {
  return (
    entry.team?.name?.trim() ||
    entry.user?.fullName?.trim() ||
    (entry.user?.handle ? `@${entry.user.handle}` : "Unnamed entrant")
  );
}

export default async function JudgeQueuePage() {
  const auth = await requireRole(["JUDGE", "ADMIN"]);
  if ("response" in auth) {
    redirect("/");
  }

  const assignments = await getJudgeAssignments(auth.user.id);

  const items: JudgeQueueItem[] = assignments
    // A submission this judge has already returned a verdict on is done; it
    // stays reachable by URL for corrections but leaves the queue.
    .filter((assignment) => assignment.verdict === null)
    .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime())
    .map((assignment) => ({
      assignmentId: assignment.id,
      submissionId: assignment.submissionId,
      arenaTitle: assignment.judge.arena.title,
      entrantName: entrantNameOf(assignment.submission.entry),
      assignedAt: assignment.assignedAt.toISOString(),
      scoredCriteria: assignment.scores.length,
      totalCriteria: assignment.judge.arena.rubrics[0]?.criteria.length ?? 0,
    }));

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background font-sans text-foreground">
      <main className="flex-1">
        <ArenaHeader
          breadcrumbs="[JUDGING CONSOLE]"
          title="Your Judging Queue"
          description="Submissions assigned to you that have no verdict yet. Newest assignment first."
        />

        <ArenaContainer className="relative z-10 py-10 md:py-16">
          <BackgroundGrid opacity={0.04} />
          <div className="mx-auto max-w-5xl space-y-6">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground">
              {items.length} assignment{items.length === 1 ? "" : "s"} awaiting a verdict
            </p>
            <JudgeQueueList items={items} />
          </div>
        </ArenaContainer>
      </main>

      <Footer />
    </div>
  );
}
