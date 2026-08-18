import type { Metadata } from "next";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ProofLookupClient } from "@/components/proof/ProofLookupClient";

export const metadata: Metadata = {
  title: "Proof Packet Verification Portal",
  description: "Verify tamper-evident developer competition credentials, rubric scorecards, and cryptographic proof packets.",
  alternates: { canonical: "/proof" },
};

export default function ProofIndexPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans relative">
      <main className="flex-1">
        <ArenaHeader
          breadcrumbs="[PUBLIC VERIFICATION]"
          title="Proof Packets"
          description="Tamper-evident hiring credentials and rubric-scored competition achievements."
        />

        <ArenaContainer className="py-10 md:py-16 relative z-10">
          <BackgroundGrid opacity={0.04} />
          <ProofLookupClient />
        </ArenaContainer>
      </main>

    </div>
  );
}
