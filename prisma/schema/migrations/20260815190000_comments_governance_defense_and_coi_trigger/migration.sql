-- Adds the models the PRD's own features require but that had no table behind
-- them (arena discussion, connection alerts, disputes, an export audit trail),
-- the recorded-defense columns, and the conflict-of-interest trigger.
--
-- Hand-assembled because the database is unreachable, so `migrate dev` cannot
-- generate it (same constraint as 20260815120000). Every CREATE TABLE / INDEX /
-- FOREIGN KEY block below was produced by
--   npx prisma migrate diff --from-empty --to-schema prisma/schema --script
-- and copied verbatim, so the object names are Prisma's own and cannot drift.
-- Only the ALTER TABLE and the trigger are written by hand.

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('ARENA_STARTING', 'ARENA_RESULTS_PUBLISHED', 'CONNECTION_JOINED_ARENA', 'JUDGE_ASSIGNED', 'SUBMISSION_SCORED', 'APPEAL_RESOLVED', 'PROOF_PACKET_ISSUED', 'COMPANY_INVITE');
CREATE TYPE "DisputeCategory" AS ENUM ('PLAGIARISM_STOLEN_CODE', 'RULE_VIOLATION', 'BROKEN_OR_FAKE_SUBMISSION', 'ABUSIVE_HARASSMENT', 'SPAM_OR_OFF_TOPIC');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'UPHELD', 'DISMISSED');

-- AlterTable
-- Recorded oral defense. Deliberately separate from `videoUrl`, which is a
-- product demo: a demo proves the thing runs, a defense proves the entrant
-- understands the diff they submitted.
ALTER TABLE "arena_submissions" ADD COLUMN IF NOT EXISTS "defenseVideoUrl" TEXT;
ALTER TABLE "arena_submissions" ADD COLUMN IF NOT EXISTS "defenseRecordedAt" TIMESTAMP(3);
ALTER TABLE "arena_submissions" ADD COLUMN IF NOT EXISTS "defensePrompts" JSONB;

-- CreateTable
CREATE TABLE "arena_comments" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "parentId" UUID,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "arenaId" UUID,
    "actorId" UUID,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "category" "DisputeCategory" NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "reporterId" UUID NOT NULL,
    "arenaId" UUID,
    "submissionId" UUID,
    "commentId" UUID,
    "detail" TEXT NOT NULL,
    "resolvedById" UUID,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arena_comments_arenaId_createdAt_idx" ON "arena_comments"("arenaId", "createdAt");
CREATE INDEX "arena_comments_parentId_idx" ON "arena_comments"("parentId");
CREATE INDEX "arena_comments_authorId_idx" ON "arena_comments"("authorId");
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");
CREATE INDEX "disputes_status_createdAt_idx" ON "disputes"("status", "createdAt");
CREATE INDEX "disputes_reporterId_idx" ON "disputes"("reporterId");
CREATE INDEX "disputes_submissionId_idx" ON "disputes"("submissionId");
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "arena_comments" ADD CONSTRAINT "arena_comments_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_comments" ADD CONSTRAINT "arena_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_comments" ADD CONSTRAINT "arena_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "arena_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- CONFLICT-OF-INTEREST TRIGGER
-- ============================================================================
-- lib/arena/judging-service.ts already refuses an assignment when the judge has
-- a *declared* conflict. That check is the fast path with the good error
-- message, and it is not sufficient on its own: it lives in one service
-- function, and a backfill script, an admin tool, or a future second code path
-- bypasses it entirely.
--
-- A judge scoring their own team's submission is unrecoverable. It invalidates
-- every proof packet issued for that arena, and a credential platform cannot
-- un-ring that bell. So the rule is enforced where it cannot be bypassed.
--
-- NOTE FOR FUTURE MAINTAINERS: Prisma does not diff triggers. `prisma db push`
-- and a schema-reset will drop this silently. Do not use `db push` on this
-- project. There is a startup assertion in lib/server/db-integrity.ts that
-- fails loudly if this trigger goes missing.

CREATE OR REPLACE FUNCTION assert_no_judge_conflict() RETURNS trigger AS $$
DECLARE
  v_judge_user_id UUID;
BEGIN
  -- judge_assignments.judgeId references arena_judges.id, not users.id.
  SELECT "userId" INTO v_judge_user_id FROM arena_judges WHERE id = NEW."judgeId";
  IF v_judge_user_id IS NULL THEN
    RAISE EXCEPTION 'COI: no arena_judges row for judgeId %', NEW."judgeId";
  END IF;

  -- The judge is the solo entrant, or a member of the entrant team.
  IF EXISTS (
    SELECT 1
    FROM arena_submissions s
    JOIN arena_entries e ON e.id = s."entryId"
    LEFT JOIN arena_team_members m ON m."teamId" = e."teamId"
    WHERE s.id = NEW."submissionId"
      AND (e."userId" = v_judge_user_id OR m."userId" = v_judge_user_id)
  ) THEN
    RAISE EXCEPTION 'COI: judge % may not score submission % - they are an entrant on it',
      v_judge_user_id, NEW."submissionId";
  END IF;

  -- A conflict the judge declared against the entrant (or any team member).
  IF EXISTS (
    SELECT 1
    FROM arena_submissions s
    JOIN arena_entries e ON e.id = s."entryId"
    LEFT JOIN arena_team_members m ON m."teamId" = e."teamId"
    JOIN judge_conflicts c
      ON c."judgeId" = NEW."judgeId"
     AND (c."userId" = e."userId" OR c."userId" = m."userId")
    WHERE s.id = NEW."submissionId"
  ) THEN
    RAISE EXCEPTION 'COI: judge % has a declared conflict with an entrant on submission %',
      v_judge_user_id, NEW."submissionId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS judge_assignments_coi ON judge_assignments;
CREATE TRIGGER judge_assignments_coi
  BEFORE INSERT OR UPDATE ON judge_assignments
  FOR EACH ROW EXECUTE FUNCTION assert_no_judge_conflict();
