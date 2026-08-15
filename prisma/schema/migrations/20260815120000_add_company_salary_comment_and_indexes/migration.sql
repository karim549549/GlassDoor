-- Adds the models the product's core feature needs (companies, salary
-- submissions, threaded company comments) and backfills the indexes the
-- existing arena/follow queries were missing.
--
-- Hand-written because the migration engine needs a direct database
-- connection that was not available when this was authored (same approach
-- as migration 20260802211000). Object and constraint names follow Prisma's
-- own conventions so `prisma migrate diff` reports no drift.

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "headcount" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_submissions" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "monthlyNetEgp" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "ratingSalary" INTEGER NOT NULL,
    "ratingLearning" INTEGER NOT NULL,
    "ratingVibes" INTEGER NOT NULL,
    "comment" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_comments" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "parentId" UUID,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE INDEX "companies_sector_idx" ON "companies"("sector");

-- CreateIndex
CREATE INDEX "salary_submissions_companyId_position_idx" ON "salary_submissions"("companyId", "position");
CREATE INDEX "salary_submissions_companyId_startDate_idx" ON "salary_submissions"("companyId", "startDate");
CREATE INDEX "salary_submissions_authorId_idx" ON "salary_submissions"("authorId");
CREATE UNIQUE INDEX "salary_submissions_companyId_authorId_key" ON "salary_submissions"("companyId", "authorId");

-- CreateIndex
CREATE INDEX "company_comments_companyId_createdAt_idx" ON "company_comments"("companyId", "createdAt");
CREATE INDEX "company_comments_parentId_idx" ON "company_comments"("parentId");
CREATE INDEX "company_comments_authorId_idx" ON "company_comments"("authorId");

-- AddForeignKey
ALTER TABLE "salary_submissions" ADD CONSTRAINT "salary_submissions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "salary_submissions" ADD CONSTRAINT "salary_submissions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_comments" ADD CONSTRAINT "company_comments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_comments" ADD CONSTRAINT "company_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_comments" ADD CONSTRAINT "company_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "company_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
-- Backfill: the schema previously carried no @@index at all. Every arena list
-- request filters on status/isPrivate/creatorId and sorts by createdAt or
-- registrationStart, so each one was a sequential scan.
CREATE INDEX "arenas_status_idx" ON "arenas"("status");
CREATE INDEX "arenas_isPrivate_idx" ON "arenas"("isPrivate");
CREATE INDEX "arenas_creatorId_idx" ON "arenas"("creatorId");
CREATE INDEX "arenas_createdAt_idx" ON "arenas"("createdAt");
CREATE INDEX "arenas_registrationStart_idx" ON "arenas"("registrationStart");

-- CreateIndex
CREATE INDEX "arena_invitations_arenaId_idx" ON "arena_invitations"("arenaId");
CREATE INDEX "arena_invitations_receiverId_idx" ON "arena_invitations"("receiverId");
CREATE INDEX "arena_invitations_senderId_idx" ON "arena_invitations"("senderId");

-- CreateIndex
CREATE INDEX "arena_teams_arenaId_idx" ON "arena_teams"("arenaId");

-- CreateIndex
-- The composite PK is ordered (teamId, userId), so the "my arenas" filter -
-- which searches members by userId alone - could not use it.
CREATE INDEX "arena_team_members_userId_idx" ON "arena_team_members"("userId");

-- CreateIndex
-- getUserProfileById() counts follows by followingId; the composite PK is
-- ordered (followerId, followingId) and cannot serve that lookup.
CREATE INDEX "follows_followingId_idx" ON "follows"("followingId");
