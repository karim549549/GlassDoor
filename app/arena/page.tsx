import ArenasListClient from "./ArenasListClient";
import { listArenas } from "@/lib/arena/service";
import { DEFAULT_LIST_PARAMS } from "@/lib/arena/schema";
import type { SerializedArenaListItem } from "@/lib/arena/types";

export const dynamic = "force-dynamic";

export default async function ArenasPage() {
  const { arenas, total, totalPages } = await listArenas(DEFAULT_LIST_PARAMS);

  // Serialize Date fields to ISO strings for the client component boundary
  const formattedArenas: SerializedArenaListItem[] = arenas.map((a) => ({
    ...a,
    registrationStart: a.registrationStart.toISOString(),
    registrationEnd: a.registrationEnd.toISOString(),
    ideaPhaseStart: a.ideaPhaseStart.toISOString(),
    ideaPhaseEnd: a.ideaPhaseEnd.toISOString(),
    implPhaseStart: a.implPhaseStart.toISOString(),
    implPhaseEnd: a.implPhaseEnd.toISOString(),
  }));

  return (
    <ArenasListClient
      initialArenas={formattedArenas}
      initialTotalPages={totalPages}
      initialTotalCount={total}
    />
  );
}
