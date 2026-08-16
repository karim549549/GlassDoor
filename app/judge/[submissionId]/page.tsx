import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/server/auth/require-user";
import { getJudgeAssignments } from "@/lib/arena/judging-service";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { SubmissionArtifacts } from "@/components/judge/SubmissionArtifacts";
import { ScoringForm } from "@/components/judge/ScoringForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Score Submission",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function JudgeScoringPage({ params }: PageProps) {
  const { submissionId } = await params;

  const auth = await requireRole(["JUDGE", "ADMIN"]);
  if ("response" in auth) {
    redirect("/");
  }

  // Scoped to this judge's own assignments, so a submission they were never
  // assigned is a 404 here rather than a page they can read.
  const assignments = await getJudgeAssignments(auth.user.id);
  const assignment = assignments.find((a) => a.submissionId === submissionId);

  if (!assignment) {
    notFound();
  }

  const { submission, judge } = assignment;
  const arena = judge.arena;
  const criteria = arena.rubrics[0]?.criteria ?? [];

  const entrantName =
    submission.entry.team?.name?.trim() ||
    submission.entry.user?.fullName?.trim() ||
    (submission.entry.user?.handle ? `@${submission.entry.user.handle}` : "Unnamed entrant");

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background font-sans text-foreground">
      <main className="flex-1">
        <ArenaHeader
          breadcrumbs={`[JUDGING CONSOLE] ${arena.title}`}
          title={entrantName}
          description={
            assignment.verdict
              ? "You have already returned a verdict for this submission. Resubmitting overwrites it."
              : "Score every rubric criterion and justify each score before submitting your verdict."
          }
        />

        <ArenaContainer className="relative z-10 py-10 md:py-16">
          <BackgroundGrid opacity={0.04} />

          <div className="mx-auto max-w-5xl space-y-6">
            <Link
              href="/judge"
              className="inline-flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-orange"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to queue
            </Link>

            <SubmissionArtifacts
              githubUrl={submission.githubUrl}
              figmaUrl={submission.figmaUrl}
              videoUrl={submission.videoUrl}
              defenseVideoUrl={submission.defenseVideoUrl}
              defenseRecordedAt={submission.defenseRecordedAt?.toISOString() ?? null}
              writeupText={submission.writeupText}
            />

            <section className="space-y-4">
              <h2 className="border-b border-foreground/15 pb-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange">
                Rubric evaluation
              </h2>

              <ScoringForm
                assignmentId={assignment.id}
                arenaId={arena.id}
                criteria={criteria.map((c) => ({
                  id: c.id,
                  title: c.title,
                  description: c.description,
                  weight: c.weight,
                  maxScore: c.maxScore,
                }))}
                existingScores={assignment.scores.map((s) => ({
                  criterionId: s.criterionId,
                  score: s.score,
                  justification: s.justification,
                }))}
                existingFeedback={assignment.verdict?.feedbackText ?? null}
              />
            </section>
          </div>
        </ArenaContainer>
      </main>

    </div>
  );
}
