import ContestsListClient from "./ContestsListClient";
import { listContests } from "@/lib/contest/service";
import { DEFAULT_LIST_PARAMS } from "@/lib/contest/schema";
import type { SerializedContestListItem } from "@/lib/contest/types";

// The initial listing query uses DEFAULT_LIST_PARAMS (no per-request query
// params or auth-scoped filtering — the "my arenas" tab is resolved client-side
// against the authenticated user), so this page is a safe ISR candidate rather
// than fully dynamic. Revalidate frequently since contest status/team counts
// change as registrations and phases progress.
//
// This page calls listContests() directly rather than fetching /api/contest,
// unlike app/contest/[id]/page.tsx and app/user/[id]/page.tsx. That's not an
// inconsistency -- it's a hard constraint: a statically-generated/ISR page's
// build-time prerender has no live server to self-fetch against (confirmed by
// a failed `next build` when this was tried), so an HTTP self-call here is
// simply not possible during static generation, only at request time -- and
// forcing this page fully dynamic to route through HTTP would erase the ISR
// win. Calling the shared service function directly is the same function the
// API route itself calls, so there's still exactly one place Prisma access
// for contest listings lives.
export const revalidate = 60;

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
