import { NextResponse, type NextRequest } from "next/server";
import { listArenas } from "@/lib/arena/service";
import { searchUsers } from "@/lib/user/service";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { DEFAULT_LIST_PARAMS } from "@/lib/arena/schema";
import { buildArenaSlug } from "@/lib/arena-slug";

/**
 * One search, every public surface.
 *
 * The nav dialog used to call `/api/arena?search=` directly, which returned the
 * full list payload - every column the board renders, for results that show a
 * title and a line of context. And it could only ever find arenas, so the one
 * control people use to ask "what is on this site" could not find a person.
 *
 * Arenas come through `listArenas` rather than a second query written here, and
 * that is the load-bearing detail: `listArenas` carries the visibility rules,
 * including the one that keeps private arenas off public surfaces. A search
 * endpoint with its own query would have been the obvious place to
 * reintroduce that leak, and would not have looked like a leak while doing it.
 *
 * The response is a list of groups rather than a flat array so a new source -
 * companies, proof packets - is one more entry, not a change of shape at every
 * consumer.
 */
export interface SearchHit {
  id: string;
  title: string;
  /** One line under the title. Never a full description. */
  subtitle: string | null;
  href: string;
  /** Rendered as a small avatar or initial. */
  imageUrl?: string | null;
}

export interface SearchGroup {
  key: "arenas" | "people";
  label: string;
  hits: SearchHit[];
}

/** Five per group: enough to recognise the right one, short enough to scan. */
const PER_GROUP = 5;

export async function GET(request: NextRequest) {
  return withApiErrorHandling("Search API error", async () => {
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

    // Two characters is where a prefix stops matching most of the table. Below
    // it every query is a full scan returning noise.
    if (q.length < 2) {
      return NextResponse.json({ groups: [] satisfies SearchGroup[] });
    }

    const viewer = await getOptionalUser();

    const [arenaResult, people] = await Promise.all([
      listArenas({
        ...DEFAULT_LIST_PARAMS,
        limit: PER_GROUP,
        search: q,
        userId: viewer?.id ?? null,
      }),
      searchUsers(q, PER_GROUP),
    ]);

    const groups: SearchGroup[] = ([
      {
        key: "arenas",
        label: "Arenas",
        hits: arenaResult.arenas.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.isTeam
            ? `Teams of ${a.minTeamSize}–${a.maxTeamSize}`
            : "Solo entry",
          href: `/arena/${buildArenaSlug(a.title, a.id)}`,
        })),
      },
      {
        key: "people",
        label: "People",
        hits: people.map((u) => ({
          id: u.id,
          title: u.handle ? `@${u.handle}` : (u.fullName ?? "Developer"),
          subtitle: u.handle ? u.fullName : u.location,
          href: u.handle ? `/u/${u.handle}` : `/user/${u.id}`,
          imageUrl: u.avatarUrl,
        })),
      },
    ] satisfies SearchGroup[]).filter((g) => g.hits.length > 0);

    return NextResponse.json({ groups });
  });
}
