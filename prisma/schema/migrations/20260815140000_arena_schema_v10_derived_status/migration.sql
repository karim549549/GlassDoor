-- CreateEnum
CREATE TYPE "ArenaFormat" AS ENUM ('REP', 'LIVE', 'ARENA');

-- CreateEnum
CREATE TYPE "ArenaAuthority" AS ENUM ('OFFICIAL', 'COMPANY', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "ArenaIntent" AS ENUM ('HIRING_ASSESSMENT', 'BRAND_HACKATHON', 'COMMUNITY_FUN');

-- CreateEnum
CREATE TYPE "RatingDomain" AS ENUM ('FULL_STACK_WEB', 'BACKEND_DISTRIBUTED', 'FRONTEND_MOBILE', 'AI_MACHINE_LEARNING', 'DATA_ENGINEERING', 'CYBERSECURITY_ETHICAL_HACKING', 'SYSTEMS_DEV_OPS', 'EMBEDDED_IOT', 'BLOCKCHAIN_WEB3');

-- CreateEnum
CREATE TYPE "DifficultyTier" AS ENUM ('NOVICE', 'INTERMEDIATE', 'ADVANCED', 'GRANDMASTER');

-- CreateEnum
CREATE TYPE "PrizeCurrency" AS ENUM ('EGP', 'USD', 'EUR', 'SAR', 'AED');

-- AlterTable arenas: Add v10 columns
ALTER TABLE "arenas"
ADD COLUMN IF NOT EXISTS "format" "ArenaFormat" NOT NULL DEFAULT 'ARENA',
ADD COLUMN IF NOT EXISTS "authority" "ArenaAuthority" NOT NULL DEFAULT 'COMMUNITY',
ADD COLUMN IF NOT EXISTS "intent" "ArenaIntent" NOT NULL DEFAULT 'COMMUNITY_FUN',
ADD COLUMN IF NOT EXISTS "domain" "RatingDomain" NOT NULL DEFAULT 'FULL_STACK_WEB',
ADD COLUMN IF NOT EXISTS "difficulty" "DifficultyTier" NOT NULL DEFAULT 'INTERMEDIATE',
ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resultsPublishedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "minRatingToEnter" INTEGER,
ADD COLUMN IF NOT EXISTS "requireHiringConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "minJudgesPerSubmission" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS "divergenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS "hasPrizePool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "totalPrizePool" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "prizeCurrency" "PrizeCurrency" NOT NULL DEFAULT 'EGP',
ADD COLUMN IF NOT EXISTS "firstPlacePrize" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "secondPlacePrize" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "thirdPlacePrize" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "prizeDisbursementTerms" TEXT,
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Backfill publishedAt from createdAt for existing arenas before dropping status column
UPDATE "arenas" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;

-- Drop legacy status column and its index
DROP INDEX IF EXISTS "arenas_status_idx";
ALTER TABLE "arenas" DROP COLUMN IF EXISTS "status";
DROP TYPE IF EXISTS "ArenaStatus";

-- Create indexes on arenas
CREATE INDEX IF NOT EXISTS "arenas_publishedAt_idx" ON "arenas"("publishedAt");
CREATE INDEX IF NOT EXISTS "arenas_implPhaseEnd_idx" ON "arenas"("implPhaseEnd");

-- Clean duplicate team names per arena before adding unique constraint
DELETE FROM "arena_teams" a USING "arena_teams" b
WHERE a.id > b.id AND a."arenaId" = b."arenaId" AND a."name" = b."name";

-- Create unique index on arena_teams
CREATE UNIQUE INDEX IF NOT EXISTS "arena_teams_arenaId_name_key" ON "arena_teams"("arenaId", "name");

-- CreateTable arena_entries
CREATE TABLE IF NOT EXISTS "arena_entries" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "userId" UUID,
    "teamId" UUID,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "arena_entries_pkey" PRIMARY KEY ("id")
);

-- Add check constraint ensuring entry belongs to either a user or a team (XOR)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'arena_entries_user_or_team_check'
    ) THEN
        ALTER TABLE "arena_entries" ADD CONSTRAINT "arena_entries_user_or_team_check"
            CHECK (("userId" IS NOT NULL AND "teamId" IS NULL) OR ("userId" IS NULL AND "teamId" IS NOT NULL));
    END IF;
END $$;

-- Create indexes and foreign keys for arena_entries
CREATE UNIQUE INDEX IF NOT EXISTS "arena_entries_arenaId_userId_key" ON "arena_entries"("arenaId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "arena_entries_arenaId_teamId_key" ON "arena_entries"("arenaId", "teamId");
CREATE INDEX IF NOT EXISTS "arena_entries_userId_idx" ON "arena_entries"("userId");
CREATE INDEX IF NOT EXISTS "arena_entries_teamId_idx" ON "arena_entries"("teamId");

ALTER TABLE "arena_entries" ADD CONSTRAINT "arena_entries_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_entries" ADD CONSTRAINT "arena_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_entries" ADD CONSTRAINT "arena_entries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "arena_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
