-- CreateTable rating_states
CREATE TABLE IF NOT EXISTS "rating_states" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "domain" "RatingDomain" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500.0,
    "deviation" DOUBLE PRECISION NOT NULL DEFAULT 350.0,
    "volatility" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "lastActivePeriod" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable rating_events
CREATE TABLE IF NOT EXISTS "rating_events" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "domain" "RatingDomain" NOT NULL,
    "period" INTEGER NOT NULL,
    "arenaId" UUID,
    "delta" DOUBLE PRECISION NOT NULL,
    "preRating" DOUBLE PRECISION NOT NULL,
    "postRating" DOUBLE PRECISION NOT NULL,
    "preDeviation" DOUBLE PRECISION NOT NULL,
    "postDeviation" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable rating_periods
CREATE TABLE IF NOT EXISTS "rating_periods" (
    "period" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_periods_pkey" PRIMARY KEY ("period")
);

-- Drop Column rating on users
ALTER TABLE "users" DROP COLUMN IF EXISTS "rating";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "rating_states_userId_domain_key" ON "rating_states"("userId", "domain");
CREATE INDEX IF NOT EXISTS "rating_states_userId_idx" ON "rating_states"("userId");
CREATE INDEX IF NOT EXISTS "rating_states_domain_rating_idx" ON "rating_states"("domain", "rating");

CREATE INDEX IF NOT EXISTS "rating_events_userId_domain_idx" ON "rating_events"("userId", "domain");
CREATE INDEX IF NOT EXISTS "rating_events_period_idx" ON "rating_events"("period");

-- AddForeignKey
ALTER TABLE "rating_states" ADD CONSTRAINT "rating_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rating_events" ADD CONSTRAINT "rating_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
