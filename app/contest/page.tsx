import ContestsListClient from "./ContestsListClient";
import { listContests } from "@/lib/contest/service";
import { DEFAULT_LIST_PARAMS } from "@/lib/contest/schema";
import type { SerializedContestListItem } from "@/lib/contest/types";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const { contests, total, totalPages } = await listContests(DEFAULT_LIST_PARAMS);

  // Serialize Date fields to ISO strings for the client component boundary
  const formattedContests: SerializedContestListItem[] = contests.map((c) => ({
    ...c,
    registrationStart: c.registrationStart.toISOString(),
    registrationEnd: c.registrationEnd.toISOString(),
    ideaPhaseStart: c.ideaPhaseStart.toISOString(),
    ideaPhaseEnd: c.ideaPhaseEnd.toISOString(),
    implPhaseStart: c.implPhaseStart.toISOString(),
    implPhaseEnd: c.implPhaseEnd.toISOString(),
  }));

  return (
    <ContestsListClient
      initialContests={formattedContests}
      initialTotalPages={totalPages}
      initialTotalCount={total}
    />
  );
}
