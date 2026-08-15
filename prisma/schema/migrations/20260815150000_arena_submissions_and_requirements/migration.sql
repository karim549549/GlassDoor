-- CreateTable arena_submissions
CREATE TABLE IF NOT EXISTS "arena_submissions" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "figmaUrl" TEXT,
    "videoUrl" TEXT,
    "writeupText" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION,
    "feedbackText" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable arena_submission_revisions
CREATE TABLE IF NOT EXISTS "arena_submission_revisions" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "githubUrl" TEXT NOT NULL,
    "figmaUrl" TEXT,
    "videoUrl" TEXT,
    "writeupText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arena_submission_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable submission_commits
CREATE TABLE IF NOT EXISTS "submission_commits" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT,
    "author" TEXT,
    "committedAt" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable arena_requirements
CREATE TABLE IF NOT EXISTS "arena_requirements" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "arena_submissions_entryId_key" ON "arena_submissions"("entryId");
CREATE INDEX IF NOT EXISTS "arena_submissions_arenaId_idx" ON "arena_submissions"("arenaId");

CREATE INDEX IF NOT EXISTS "arena_submission_revisions_submissionId_idx" ON "arena_submission_revisions"("submissionId");

CREATE UNIQUE INDEX IF NOT EXISTS "submission_commits_submissionId_sha_key" ON "submission_commits"("submissionId", "sha");
CREATE INDEX IF NOT EXISTS "submission_commits_submissionId_idx" ON "submission_commits"("submissionId");

CREATE INDEX IF NOT EXISTS "arena_requirements_arenaId_idx" ON "arena_requirements"("arenaId");

-- AddForeignKey
ALTER TABLE "arena_submissions" ADD CONSTRAINT "arena_submissions_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_submissions" ADD CONSTRAINT "arena_submissions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "arena_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "arena_submission_revisions" ADD CONSTRAINT "arena_submission_revisions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_commits" ADD CONSTRAINT "submission_commits_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "arena_requirements" ADD CONSTRAINT "arena_requirements_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
