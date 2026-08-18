import type { Metadata } from "next";
import ArenasListClient from "../ArenasListClient";
import { listArenas, getBoardFacets, getBoardSpotlight } from "@/lib/arena/service";
import { listInvitationsForUser } from "@/lib/arena/invitation-service";
import { DEFAULT_LIST_PARAMS } from "@/lib/arena/schema";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import type { SerializedArenaListItem } from "@/lib/arena/types";

export const metadata: Metadata = {
  title: "Open Challenges",
  description:
    "Every arena you can enter right now: team coding challenges, online and in Cairo. Free to enter, solo or in teams of two to four.",
  alternates: { canonical: "/arena" },
  openGraph: {
    title: "Open Challenges | Devs Arena",
    description:
      "Every arena you can enter right now. Free to enter, solo or in teams of two to four.",
    url: "/arena",
  },
};

export const dynamic = "force-dynamic";

export default async function ArenasPage() {
  const now = new Date();
  const viewer = await getOptionalUser();
  const [{ arenas, total, totalPages, myCount }, facets, spotlight, invitations] =
    await Promise.all([
      listArenas({ ...DEFAULT_LIST_PARAMS, userId: viewer?.id ?? null, now }),
      getBoardFacets(now),
      getBoardSpotlight(now),
      // A guest has none by definition, and asking costs a query to prove it.
      viewer ? listInvitationsForUser(viewer.id, now) : Promise.resolve([]),
    ]);

  const serializeSpotlight = (rows: typeof spotlight.closingSoon) =>
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      at: r.at.toISOString(),
      entered: r.entered,
    }));

  const formattedArenas: SerializedArenaListItem[] = arenas.map((a) => ({
    ...a,
    registrationStart: a.registrationStart.toISOString(),
    registrationEnd: a.registrationEnd.toISOString(),
    ideaPhaseStart: a.ideaPhaseStart.toISOString(),
    ideaPhaseEnd: a.ideaPhaseEnd.toISOString(),
    implPhaseStart: a.implPhaseStart.toISOString(),
    implPhaseEnd: a.implPhaseEnd.toISOString(),
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    canceledAt: a.canceledAt ? a.canceledAt.toISOString() : null,
    resultsPublishedAt: a.resultsPublishedAt ? a.resultsPublishedAt.toISOString() : null,
  }));

  return (
    <ArenasListClient
      initialArenas={formattedArenas}
      initialTotalPages={totalPages}
      initialTotalCount={total}
      initialMyCount={myCount}
      nowIso={now.toISOString()}
      facets={{
        open: facets.open,
        live: facets.live,
        finished: facets.finished,
        total: facets.total,
        nextDeadline: facets.nextDeadline ? facets.nextDeadline.toISOString() : null,
      }}
      invitations={invitations.map((i) => ({
        id: i.id,
        arenaId: i.arena.id,
        arenaTitle: i.arena.title,
        arenaSlug: i.arena.slug,
        senderName: i.sender.fullName ?? (i.sender.handle ? `@${i.sender.handle}` : "A host"),
        senderHandle: i.sender.handle,
        registrationEnd: i.arena.registrationEnd.toISOString(),
        isPrivate: i.arena.isPrivate,
      }))}
      spotlight={{
        closingSoon: serializeSpotlight(spotlight.closingSoon),
        runningNow: serializeSpotlight(spotlight.runningNow),
      }}
    />
  );
}
