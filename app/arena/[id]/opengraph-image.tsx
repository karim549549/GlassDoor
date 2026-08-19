import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { parseArenaRef } from "@/lib/arena-slug";
import { getArenaDetail } from "@/lib/arena/service";
import { deriveArenaStatus } from "@/lib/arena/status";

/**
 * The card an arena renders when someone shares it.
 *
 * The page has always declared `twitter: { card: "summary_large_image" }` and
 * has never had an image to put in it, so every arena shared to Twitter,
 * LinkedIn, Slack or WhatsApp rendered as a blank frame with a title under it -
 * worse than declaring no card at all, because the platform reserves the space.
 *
 * An arena is the one thing on this site worth sharing: somebody posts a brief
 * and wants people to turn up. The card carries what decides that - the brief's
 * headline, who is running it, and when it shuts.
 *
 * Generated rather than stored, for the same reasons as the homepage's: it
 * stays in sync with the tokens, there is no binary in the repo, and it fetches
 * no webfont, which would put a network call on the critical path of an image
 * nobody inspects at full size.
 */
export const alt = "An arena on Devs Arena";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Crawlers refetch this far more often than the arena changes, and it costs a
 * database query and a render each time. An hour is well inside the window
 * where a title or a deadline could move and nobody would be misled.
 */
export const revalidate = 3600;

const PAPER = "#F1EFE9";
const INK = "#0E0E0D";
const ORANGE = "#E8621A";

const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const STATUS_WORD: Record<string, string> = {
  SCHEDULED: "OPENS SOON",
  REGISTRATION_OPEN: "OPEN TO ENTER",
  IDEA_PHASE: "PLANNING NOW",
  IMPLEMENTATION_PHASE: "BEING BUILT NOW",
  UNDER_JUDGING: "BEING JUDGED",
  COMPLETED: "FINISHED",
  CANCELED: "CALLED OFF",
  DRAFT: "NOT PUBLISHED",
};

export default async function ArenaOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ref = parseArenaRef(id);

  // Viewer is null: this is rendered for a crawler, so it only ever sees what
  // an anonymous reader sees. A private arena has no card, which is correct -
  // the gate returns null and there is nothing to advertise.
  const result = ref ? await getArenaDetail(ref, null) : null;
  if (!result) notFound();

  const { arena } = result;
  const status = deriveArenaStatus(arena, new Date());
  const host = arena.creator.fullName ?? (arena.creator.handle ? `@${arena.creator.handle}` : null);

  const prize =
    arena.hasPrizePool && arena.totalPrizePool
      ? `${Number(arena.totalPrizePool).toLocaleString()} ${arena.prizeCurrency}`
      : null;

  const facts = [
    arena.locationType === "ONLINE" ? "ONLINE" : (arena.locationName ?? "IN PERSON").toUpperCase(),
    arena.isTeam ? `TEAMS OF ${arena.minTeamSize}-${arena.maxTeamSize}` : "SOLO",
    `CLOSES ${DATE.format(arena.registrationEnd).toUpperCase()}`,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: PAPER,
          padding: "56px 68px",
          backgroundImage:
            "linear-gradient(to right, rgba(241,239,233,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,239,233,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, fontWeight: 700, color: ORANGE }}>
            DEVS ARENA
          </div>
          <div
            style={{
              display: "flex",
              border: `2px solid ${ORANGE}`,
              color: ORANGE,
              padding: "8px 16px",
              fontSize: 18,
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            {STATUS_WORD[status] ?? status}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: arena.title.length > 52 ? 62 : 78,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {arena.title}
          </div>
          {host && (
            <div style={{ display: "flex", fontSize: 27, opacity: 0.72 }}>Run by {host}</div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            borderTop: `2px solid ${ORANGE}`,
            paddingTop: 24,
            fontSize: 19,
            letterSpacing: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              background: ORANGE,
              color: INK,
              padding: "10px 18px",
              fontWeight: 700,
            }}
          >
            {prize ?? "FREE TO ENTER"}
          </div>
          <div style={{ display: "flex", opacity: 0.62 }}>{facts.join("  /  ")}</div>
        </div>
      </div>
    ),
    size
  );
}
