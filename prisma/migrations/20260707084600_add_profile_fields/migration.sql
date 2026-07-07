-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "userId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "job_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "job_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_job_types" (
    "userId" UUID NOT NULL,
    "jobTypeId" UUID NOT NULL,

    CONSTRAINT "user_job_types_pkey" PRIMARY KEY ("userId","jobTypeId")
);

-- CreateTable
CREATE TABLE "follows" (
    "followerId" UUID NOT NULL,
    "followingId" UUID NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_types_name_key" ON "job_types"("name");

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_types" ADD CONSTRAINT "user_job_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_types" ADD CONSTRAINT "user_job_types_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "job_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "handle" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "employmentStatus" TEXT,
ADD COLUMN "currentEmployer" TEXT,
ADD COLUMN "seniority" TEXT,
ADD COLUMN "education" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "portfolioUrl" TEXT,
ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastActiveAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");
