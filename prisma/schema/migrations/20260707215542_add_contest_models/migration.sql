-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'IDEA_PHASE', 'IDEA_REVIEW', 'IMPLEMENTATION_PHASE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "contests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "creatorId" UUID NOT NULL,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "ideaPhaseStart" TIMESTAMP(3) NOT NULL,
    "ideaPhaseEnd" TIMESTAMP(3) NOT NULL,
    "implPhaseStart" TIMESTAMP(3) NOT NULL,
    "implPhaseEnd" TIMESTAMP(3) NOT NULL,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER,
    "requireGithubUrl" BOOLEAN NOT NULL DEFAULT true,
    "requireFigmaUrl" BOOLEAN NOT NULL DEFAULT false,
    "requireVideoUrl" BOOLEAN NOT NULL DEFAULT false,
    "requireWriteup" BOOLEAN NOT NULL DEFAULT true,
    "rulesText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_invitations" (
    "id" UUID NOT NULL,
    "contestId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_teams" (
    "id" UUID NOT NULL,
    "contestId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_team_members" (
    "teamId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contest_team_members_pkey" PRIMARY KEY ("teamId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "contests_inviteCode_key" ON "contests"("inviteCode");

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_invitations" ADD CONSTRAINT "contest_invitations_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_invitations" ADD CONSTRAINT "contest_invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_invitations" ADD CONSTRAINT "contest_invitations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_teams" ADD CONSTRAINT "contest_teams_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_team_members" ADD CONSTRAINT "contest_team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "contest_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_team_members" ADD CONSTRAINT "contest_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
