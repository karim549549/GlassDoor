import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProofPacketBySlug } from "@/lib/proof/proof-service";
import { ProofPacketView } from "@/components/proof/ProofPacketView";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const loadPacket = cache((slug: string) => getProofPacketBySlug(slug));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const packet = await loadPacket(slug);

  if (!packet) {
    return { title: "Proof Packet Not Found" };
  }

  const holderName =
    packet.snapshot.entrant.teamName ||
    packet.snapshot.entrant.members[0]?.fullName ||
    `@${packet.snapshot.entrant.members[0]?.handle}`;

  return {
    title: `Proof Packet #${slug} — ${holderName} | Devs Arena`,
    description: `Verified competition credential for ${holderName} in ${packet.snapshot.arena.title}. SHA-256: ${packet.contentHash.substring(0, 16)}...`,
    alternates: { canonical: `/proof/${slug}` },
  };
}

export default async function ProofPacketPage({ params }: PageProps) {
  const { slug } = await params;
  const packet = await loadPacket(slug);

  if (!packet) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans relative">
      <main className="flex-1">
        <ArenaHeader
          breadcrumbs="[PUBLIC CREDENTIAL / PROOF PACKET]"
          title="Verified Achievement"
          description="Cryptographically sealed competition outcome and tamper-evident assessment artifact."
        />

        <ArenaContainer className="py-10 md:py-16 relative z-10">
          <BackgroundGrid opacity={0.04} />
          <ProofPacketView
            slug={packet.slug}
            contentHash={packet.contentHash}
            issuedAt={packet.issuedAt.toISOString()}
            isRevoked={packet.isRevoked}
            revocationReason={packet.revocationReason}
            isCryptographicallyValid={packet.isCryptographicallyValid}
            snapshot={packet.snapshot}
          />
        </ArenaContainer>
      </main>

    </div>
  );
}
