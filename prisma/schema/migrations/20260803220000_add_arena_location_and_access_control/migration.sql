-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ONLINE', 'IN_PERSON');

-- AlterTable
ALTER TABLE "arenas" ADD COLUMN "locationType" "LocationType" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN "locationName" TEXT,
ADD COLUMN "googleMapsUrl" TEXT,
ADD COLUMN "allowLeaderAccessControl" BOOLEAN DEFAULT true;
