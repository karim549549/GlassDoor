import { NextResponse, type NextRequest } from "next/server";
import { listArenas } from "@/lib/arena/service";
import { searchUsers } from "@/lib/user/service";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { DEFAULT_LIST_PARAMS } from "@/lib/arena/schema";

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

const GROUP_KEYS = ["arenas", "people"] as const;
type GroupKey = (typeof GROUP_KEYS)[number];

/**
 * `?only=people` narrows the response to one group.
 *
 * Added for the invite picker, which is looking for a person and would show
 * arena results as noise. It is a filter on this route rather than a second
 * endpoint on purpose: `listArenas` carries the visibility rules that keep
 * private arenas off public surfaces, and a parallel search endpoint is
 * exactly where that would get reintroduced by someone writing their own
 * query.
 *
 * An unknown or absent value means every group, so a malformed parameter
 * widens the answer rather than emptying it.
 */
function requestedGroups(raw: string | null): Set<GroupKey> {
  const asked = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is GroupKey => (GROUP_KEYS as readonly string[]).includes(s));

  return asked.length > 0 ? new Set(asked) : new Set(GROUP_KEYS);
}

export async function GET(request: NextRequest) {
  return withApiErrorHandling("Search API error", async () => {
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

    // Two characters is where a prefix stops matching most of the table. Below
    // it every query is a full scan returning noise.
    if (q.length < 2) {
      return NextResponse.json({ groups: [] satisfies SearchGroup[] });
    }

    const viewer = await getOptionalUser();
    const wanted = requestedGroups(request.nextUrl.searchParams.get("only"));

    // A group nobody asked for is a query nobody pays for.
    const [arenaResult, people] = await Promise.all([
      wanted.has("arenas")
        ? listArenas({
            ...DEFAULT_LIST_PARAMS,
            limit: PER_GROUP,
            search: q,
            userId: viewer?.id ?? null,
          })
        : Promise.resolve({ arenas: [] as Awaited<ReturnType<typeof listArenas>>["arenas"] }),
      wanted.has("people") ? searchUsers(q, PER_GROUP) : Promise.resolve([]),
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
          href: `/arena/${a.slug}`,
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
