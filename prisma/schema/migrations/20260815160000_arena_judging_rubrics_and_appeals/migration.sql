-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable rubrics
CREATE TABLE IF NOT EXISTS "rubrics" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isImmutable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable rubric_criteria
CREATE TABLE IF NOT EXISTS "rubric_criteria" (
    "id" UUID NOT NULL,
    "rubricId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable arena_judges
CREATE TABLE IF NOT EXISTS "arena_judges" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "arena_judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable judge_assignments
CREATE TABLE IF NOT EXISTS "judge_assignments" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "judgeId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable judge_scores
CREATE TABLE IF NOT EXISTS "judge_scores" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "criterionId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "justification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable judge_verdicts
CREATE TABLE IF NOT EXISTS "judge_verdicts" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "feedbackText" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_verdicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable appeals
CREATE TABLE IF NOT EXISTS "appeals" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "reasonText" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "resolutionText" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appeals_pkey" PRIMARY KEY ("id")
);

-- CreateTable judge_conflicts
CREATE TABLE IF NOT EXISTS "judge_conflicts" (
    "id" UUID NOT NULL,
    "judgeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "rubrics_arenaId_version_key" ON "rubrics"("arenaId", "version");
CREATE INDEX IF NOT EXISTS "rubrics_arenaId_idx" ON "rubrics"("arenaId");

CREATE INDEX IF NOT EXISTS "rubric_criteria_rubricId_idx" ON "rubric_criteria"("rubricId");

CREATE UNIQUE INDEX IF NOT EXISTS "arena_judges_arenaId_userId_key" ON "arena_judges"("arenaId", "userId");
CREATE INDEX IF NOT EXISTS "arena_judges_arenaId_idx" ON "arena_judges"("arenaId");
CREATE INDEX IF NOT EXISTS "arena_judges_userId_idx" ON "arena_judges"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "judge_assignments_submissionId_judgeId_key" ON "judge_assignments"("submissionId", "judgeId");
CREATE INDEX IF NOT EXISTS "judge_assignments_submissionId_idx" ON "judge_assignments"("submissionId");
CREATE INDEX IF NOT EXISTS "judge_assignments_judgeId_idx" ON "judge_assignments"("judgeId");

CREATE UNIQUE INDEX IF NOT EXISTS "judge_scores_assignmentId_criterionId_key" ON "judge_scores"("assignmentId", "criterionId");
CREATE INDEX IF NOT EXISTS "judge_scores_assignmentId_idx" ON "judge_scores"("assignmentId");
CREATE INDEX IF NOT EXISTS "judge_scores_criterionId_idx" ON "judge_scores"("criterionId");

CREATE UNIQUE INDEX IF NOT EXISTS "judge_verdicts_assignmentId_key" ON "judge_verdicts"("assignmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "appeals_submissionId_key" ON "appeals"("submissionId");

CREATE UNIQUE INDEX IF NOT EXISTS "judge_conflicts_judgeId_userId_key" ON "judge_conflicts"("judgeId", "userId");
CREATE INDEX IF NOT EXISTS "judge_conflicts_judgeId_idx" ON "judge_conflicts"("judgeId");
CREATE INDEX IF NOT EXISTS "judge_conflicts_userId_idx" ON "judge_conflicts"("userId");

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "arena_judges" ADD CONSTRAINT "arena_judges_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_judges" ADD CONSTRAINT "arena_judges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "arena_judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "judge_scores" ADD CONSTRAINT "judge_scores_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "judge_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "judge_scores" ADD CONSTRAINT "judge_scores_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "rubric_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "judge_verdicts" ADD CONSTRAINT "judge_verdicts_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "judge_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appeals" ADD CONSTRAINT "appeals_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "judge_conflicts" ADD CONSTRAINT "judge_conflicts_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "arena_judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "judge_conflicts" ADD CONSTRAINT "judge_conflicts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
