import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { parseArenaRef } from "@/lib/arena-slug";
import { getArenaForEdit } from "@/lib/arena/service";
import { requireUser } from "@/lib/server/auth/require-user";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { PageMasthead } from "@/components/site/PageMasthead";
import { EditArenaMount } from "@/components/arena/edit/EditArenaMount";
import type { EditableArena } from "@/components/arena/edit/EditArenaClient";

export const metadata: Metadata = {
  title: "Edit Brief",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArenaPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const ref = parseArenaRef(slugParam);

  const auth = await requireUser();
  if ("response" in auth) {
    redirect(`/login?redirectTo=/arena/${encodeURIComponent(slugParam)}/edit`);
  }

  const arena = ref ? await getArenaForEdit(ref, auth.user.id) : null;

  /**
   * One 404 for four different refusals: no such arena, not yours, called off,
   * already finished. Same reasoning as `getArenaDetail` - a stranger probing
   * uuids should not learn which of those it was, and a host who genuinely
   * owns a finished arena is told so on its own page rather than here.
   */
  if (!arena) {
    notFound();
  }

  // `Decimal` and `Date` do not cross into a client component. Both become the
  // primitives the form actually binds to.
  const money = (v: unknown) => (v === null || v === undefined ? null : Number(v));

  const editable: EditableArena = {
    id: arena.id,
    slug: arena.slug,
    title: arena.title,
    description: arena.description,
    rules: arena.rules,
    difficulty: arena.difficulty,
    locationType: arena.locationType,
    locationName: arena.locationName,
    googleMapsUrl: arena.googleMapsUrl,
    isPrivate: arena.isPrivate,
    inviteCode: arena.inviteCode,
    isTeam: arena.isTeam,
    minTeamSize: arena.minTeamSize,
    maxTeamSize: arena.maxTeamSize,
    maxParticipants: arena.maxParticipants,
    allowLeaderAccessControl: arena.allowLeaderAccessControl,
    defaultTeamJoinPolicy: arena.defaultTeamJoinPolicy,
    hasPrizePool: arena.hasPrizePool,
    totalPrizePool: money(arena.totalPrizePool),
    prizeCurrency: arena.prizeCurrency,
    firstPlacePrize: money(arena.firstPlacePrize),
    secondPlacePrize: money(arena.secondPlacePrize),
    thirdPlacePrize: money(arena.thirdPlacePrize),
    prizeDisbursementTerms: arena.prizeDisbursementTerms,
    requireHiringConsent: arena.requireHiringConsent,
    companyId: arena.companyId,
    requireGithubUrl: arena.requireGithubUrl,
    requireFigmaUrl: arena.requireFigmaUrl,
    requireVideoUrl: arena.requireVideoUrl,
    requireWriteup: arena.requireWriteup,
    registrationStart: arena.registrationStart.toISOString(),
    registrationEnd: arena.registrationEnd.toISOString(),
    ideaPhaseStart: arena.ideaPhaseStart.toISOString(),
    ideaPhaseEnd: arena.ideaPhaseEnd.toISOString(),
    implPhaseStart: arena.implPhaseStart.toISOString(),
    implPhaseEnd: arena.implPhaseEnd.toISOString(),
  };

  return (
    <main id="main-content" className="relative min-h-screen bg-background text-foreground">
      <BackgroundGrid opacity={0.055} />
      <PageMasthead
        eyebrow="Edit brief"
        title={arena.title}
        standfirst="Change anything that has not happened yet. A window that has already passed can be extended, but not pulled back — people entered against the dates as they stood."
        size="short"
      />

      <EditArenaMount arena={editable} />
    </main>
  );
}
