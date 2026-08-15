-- Drop legacy salary and review tables
DROP TABLE IF EXISTS "salary_submissions";
DROP TABLE IF EXISTS "company_comments";

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'ADMIN', 'RECRUITER', 'BILLING_MANAGER');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('FINTECH', 'ARTIFICIAL_INTELLIGENCE', 'HEALTH_TECH', 'E_COMMERCE', 'ED_TECH', 'LOGISTICS_SUPPLY_CHAIN', 'CYBERSECURITY', 'DEVELOPER_TOOLS', 'GAMING_ENTERTAINMENT', 'ENTERPRISE_SAAS', 'TELECOMMUNICATIONS', 'GREEN_TECH', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SEED', 'STARTUP', 'GROWTH', 'MID_MARKET', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "companies"
DROP COLUMN IF EXISTS "sector",
DROP COLUMN IF EXISTS "headcount",
DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "website",
ADD COLUMN IF NOT EXISTS "domain" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT,
ADD COLUMN IF NOT EXISTS "locationName" TEXT,
ADD COLUMN IF NOT EXISTS "governorate" TEXT DEFAULT 'Cairo',
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Egypt',
ADD COLUMN IF NOT EXISTS "industry" "IndustryType" NOT NULL DEFAULT 'DEVELOPER_TOOLS',
ADD COLUMN IF NOT EXISTS "size" "CompanySize" NOT NULL DEFAULT 'STARTUP',
ADD COLUMN IF NOT EXISTS "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS "maxRecruiters" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Backfill domain for any existing companies before unique constraint
UPDATE "companies" SET "domain" = "slug" || '.com' WHERE "domain" IS NULL;
ALTER TABLE "companies" ALTER COLUMN "domain" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "companies_domain_key" ON "companies"("domain");
CREATE INDEX IF NOT EXISTS "companies_industry_idx" ON "companies"("industry");

-- AlterTable
ALTER TABLE "arenas" ADD COLUMN IF NOT EXISTS "companyId" UUID;

-- CreateTable
CREATE TABLE IF NOT EXISTS "company_members" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'RECRUITER',
    "inviteTokenHash" TEXT,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "arena_sponsors" (
    "id" UUID NOT NULL,
    "arenaId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "customBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arena_sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "company_members_inviteTokenHash_key" ON "company_members"("inviteTokenHash");
CREATE UNIQUE INDEX IF NOT EXISTS "company_members_companyId_userId_key" ON "company_members"("companyId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "arena_sponsors_arenaId_companyId_key" ON "arena_sponsors"("arenaId", "companyId");

-- AddForeignKey
ALTER TABLE "arenas" ADD CONSTRAINT "arenas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_sponsors" ADD CONSTRAINT "arena_sponsors_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arena_sponsors" ADD CONSTRAINT "arena_sponsors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
