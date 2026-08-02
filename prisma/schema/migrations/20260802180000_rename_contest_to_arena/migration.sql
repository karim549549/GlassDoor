-- Rename Enum
ALTER TYPE "ContestStatus" RENAME TO "ArenaStatus";

-- Rename Tables
ALTER TABLE "contests" RENAME TO "arenas";
ALTER TABLE "contest_invitations" RENAME TO "arena_invitations";
ALTER TABLE "contest_teams" RENAME TO "arena_teams";
ALTER TABLE "contest_team_members" RENAME TO "arena_team_members";

-- Rename Columns on related tables
ALTER TABLE "arena_invitations" RENAME COLUMN "contestId" TO "arenaId";
ALTER TABLE "arena_teams" RENAME COLUMN "contestId" TO "arenaId";

-- Rename Primary Key Constraints
ALTER TABLE "arenas" RENAME CONSTRAINT "contests_pkey" TO "arenas_pkey";
ALTER TABLE "arena_invitations" RENAME CONSTRAINT "contest_invitations_pkey" TO "arena_invitations_pkey";
ALTER TABLE "arena_teams" RENAME CONSTRAINT "contest_teams_pkey" TO "arena_teams_pkey";
ALTER TABLE "arena_team_members" RENAME CONSTRAINT "contest_team_members_pkey" TO "arena_team_members_pkey";

-- Rename Unique Index
ALTER INDEX "contests_inviteCode_key" RENAME TO "arenas_inviteCode_key";

-- Rename Foreign Key Constraints
ALTER TABLE "arenas" RENAME CONSTRAINT "contests_creatorId_fkey" TO "arenas_creatorId_fkey";
ALTER TABLE "arena_invitations" RENAME CONSTRAINT "contest_invitations_contestId_fkey" TO "arena_invitations_arenaId_fkey";
ALTER TABLE "arena_invitations" RENAME CONSTRAINT "contest_invitations_senderId_fkey" TO "arena_invitations_senderId_fkey";
ALTER TABLE "arena_invitations" RENAME CONSTRAINT "contest_invitations_receiverId_fkey" TO "arena_invitations_receiverId_fkey";
ALTER TABLE "arena_teams" RENAME CONSTRAINT "contest_teams_contestId_fkey" TO "arena_teams_arenaId_fkey";
ALTER TABLE "arena_team_members" RENAME CONSTRAINT "contest_team_members_teamId_fkey" TO "arena_team_members_teamId_fkey";
ALTER TABLE "arena_team_members" RENAME CONSTRAINT "contest_team_members_userId_fkey" TO "arena_team_members_userId_fkey";
