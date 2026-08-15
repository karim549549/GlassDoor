import ArenasListClient from "./ArenasListClient";
import { listArenas } from "@/lib/arena/service";
import { DEFAULT_LIST_PARAMS } from "@/lib/arena/schema";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import type { SerializedArenaListItem } from "@/lib/arena/types";

export const dynamic = "force-dynamic";

export default async function ArenasPage() {
  const viewer = await getOptionalUser();
  const { arenas, total, totalPages, myCount } = await listArenas({
    ...DEFAULT_LIST_PARAMS,
    userId: viewer?.id ?? null,
  });

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
    />
  );
}
