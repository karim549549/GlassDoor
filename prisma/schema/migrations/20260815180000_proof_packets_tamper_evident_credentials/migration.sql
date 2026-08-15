-- CreateTable proof_packets
CREATE TABLE IF NOT EXISTS "proof_packets" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "submissionId" UUID NOT NULL,
    "contentHash" TEXT NOT NULL,
    "payloadSnapshot" JSONB NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_packets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "proof_packets_slug_key" ON "proof_packets"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "proof_packets_submissionId_key" ON "proof_packets"("submissionId");
CREATE INDEX IF NOT EXISTS "proof_packets_slug_idx" ON "proof_packets"("slug");

-- AddForeignKey
ALTER TABLE "proof_packets" ADD CONSTRAINT "proof_packets_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "arena_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
