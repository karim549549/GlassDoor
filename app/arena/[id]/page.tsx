import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { parseArenaRef } from "@/lib/arena-slug";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getArenaDetail } from "@/lib/arena/service";
import { listInvitationsForArena } from "@/lib/arena/invitation-service";
import { resolveViewer, toArenaDetailDto } from "@/lib/arena/dto";
import { deriveArenaStatus } from "@/lib/arena/status";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaMasthead } from "@/components/arena/detail/ArenaMasthead";
import { ArenaPhaseline } from "@/components/arena/detail/ArenaPhaseline";
import { ArenaBrief } from "@/components/arena/detail/ArenaBrief";
import { ArenaActionPanel } from "@/components/arena/detail/ArenaActionPanel";
import { ArenaParticipants } from "@/components/arena/detail/ArenaParticipants";
import { ArenaHostSections } from "@/components/arena/detail/ArenaHostSections";
import { ArenaComments } from "@/components/arena/detail/ArenaComments";
import { ArenaLeaderboard } from "@/components/arena/detail/ArenaLeaderboard";
import {
  DetailPanel,
  Fact,
  FactList,
  STATUS_COPY,
} from "@/components/arena/detail/panels";

/**
 * One arena, one layout, one role-aware panel.
 *
 * The page this replaces rendered its call to action twice - once in the hero
 * and once in the sidebar - from two components implementing the same
 * seven-branch decision, so a private arena showed two invite-code fields and
 * a host got two EDIT ARENA buttons, neither of which had an `onClick`. It
 * also showed no authority badge and none of the seven prize fields, so an
 * arena advertising money on the board said nothing about it on its own page.
 *
 * Everything that varies by reader is in `ArenaActionPanel`; everything only
 * the host may see is in `ArenaHostSections`. The rest of the page is the same
 * for all four relationships, which is what stops 8 statuses x 4 readers
 * becoming 32 things to keep in step.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadArena = cache((ref: string, viewerId: string | null) => {
  const parsed = parseArenaRef(ref);
  return parsed ? getArenaDetail(parsed, viewerId) : Promise.resolve(null);
});

function toMetaText(description: string, maxLength: number): string {
  return description.replace(/[#*`>]/g, "").slice(0, maxLength).trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugParam } = await params;
  const result = await loadArena(slugParam, null);

  if (!result) {
    return { title: "Arena Not Found" };
  }

  const { arena } = result;
  const cleanDescription = toMetaText(arena.description, 160);
  const canonicalUrl = `${getSiteUrl()}/arena/${arena.slug}`;

  return {
    title: `${arena.title} | Devs Arena`,
    description: cleanDescription,
    keywords: ["hackathon", "arena", "coding competition", arena.title],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: arena.title,
      description: cleanDescription,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: arena.title,
      description: cleanDescription,
    },
  };
}


export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;

  const viewerUser = await getOptionalUser();
  const result = await loadArena(slugParam, viewerUser?.id ?? null);

  if (!result) {
    notFound();
  }

  /**
   * One arena, one address.
   *
   * Every link shared before slugs existed ends in `title-uuid`, and those
   * still resolve - but they redirect here rather than rendering, so a
   * history dropdown converges on the readable form instead of accumulating
   * two entries per arena. 308 because the move is permanent and the method
   * must survive it.
   */
  if (slugParam !== result.arena.slug) {
    permanentRedirect(`/arena/${result.arena.slug}`);
  }

  const { arena: raw, meta } = result;
  const now = new Date();
  const nowIso = now.toISOString();
  const status = deriveArenaStatus(raw, now);

  const viewer = resolveViewer({
    userId: viewerUser?.id ?? null,
    creatorId: raw.creatorId,
    isRegistered: meta.isRegistered,
  });

  // Through the DTO, always: it is what drops `inviteCode` for everyone but
  // the host and every participant's user id for everyone including them.
  const arena = toArenaDetailDto(raw, status, viewer);

  // Only fetched for the host, because only the host may see it.
  const invitations = viewer.isHost
    ? await listInvitationsForArena(arena.id, viewerUser!.id)
    : null;

  const canonicalUrl = `${getSiteUrl()}/arena/${arena.slug}`;
  const isOnline = arena.locationType === "ONLINE";

  const location = isOnline
    ? { "@type": "VirtualLocation", url: canonicalUrl }
    : arena.locationName
      ? {
          "@type": "Place",
          name: arena.locationName,
          address: arena.locationName,
          ...(arena.googleMapsUrl ? { hasMap: arena.googleMapsUrl } : {}),
        }
      : null;

  const organizerName = arena.creator.fullName || arena.creator.handle;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: arena.title,
    description: toMetaText(arena.description, 300),
    url: canonicalUrl,
    startDate: arena.registrationStart,
    endDate: arena.implPhaseEnd,
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    // The one status schema.org has that is not "scheduled", and the only one
    // this page can now actually reach, since something finally writes
    // `canceledAt`.
    eventStatus:
      status === "CANCELED"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    ...(location ? { location } : {}),
    ...(organizerName ? { organizer: { "@type": "Person", name: organizerName } } : {}),
  };

  const statusCopy = STATUS_COPY[status] ?? { label: status, tone: "past" as const };
  const hostName =
    arena.creator.fullName ?? (arena.creator.handle ? `@${arena.creator.handle}` : "A host");

  /**
   * The one clock that matters right now.
   *
   * An arena has six timestamps and exactly one of them is the answer to "how
   * long have I got" - which one depends on where in the run it is. Picking it
   * here means the masthead never has to.
   */
  const countdown: { target: string; label: string } | null =
    status === "SCHEDULED"
      ? { target: arena.registrationStart, label: "Entries open in" }
      : status === "REGISTRATION_OPEN"
        ? { target: arena.registrationEnd, label: "Entries close in" }
        : status === "IDEA_PHASE"
          ? { target: arena.ideaPhaseEnd, label: "Building starts in" }
          : status === "IMPLEMENTATION_PHASE"
            ? { target: arena.implPhaseEnd, label: "Submissions lock in" }
            : null;

  const spine = [
    isOnline ? "Online" : (arena.locationName ?? "In person"),
    arena.isTeam ? `Teams of ${arena.minTeamSize}-${arena.maxTeamSize}` : "Solo",
    arena.difficulty.charAt(0) + arena.difficulty.slice(1).toLowerCase(),
    arena.maxParticipants
      ? `${arena.entrantCount}/${arena.maxParticipants} in`
      : `${arena.entrantCount} in`,
  ];

  const deliverables = [
    arena.requireGithubUrl && "A repository",
    arena.requireVideoUrl && "A demo video",
    arena.requireFigmaUrl && "A Figma file",
    arena.requireWriteup && "A short write-up",
  ].filter(Boolean) as string[];

  const prize =
    arena.hasPrizePool && arena.totalPrizePool && arena.totalPrizePool > 0
      ? `${arena.totalPrizePool.toLocaleString()} ${arena.prizeCurrency}`
      : null;

  const places = [
    ["1st", arena.firstPlacePrize],
    ["2nd", arena.secondPlacePrize],
    ["3rd", arena.thirdPlacePrize],
  ].filter(([, amount]) => typeof amount === "number" && amount > 0) as [string, number][];

  const registrationOpen = status === "REGISTRATION_OPEN" || status === "SCHEDULED";
  const hasRun = now >= new Date(arena.implPhaseEnd);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <main id="main-content" className="relative min-h-screen bg-background text-foreground">
        <BackgroundGrid opacity={0.055} />

        <ArenaMasthead
          title={arena.title}
          statusLabel={statusCopy.label}
          authority={arena.authority}
          host={{
            name: hostName,
            handle: arena.creator.handle,
            avatarUrl: arena.creator.avatarUrl,
          }}
          countdown={countdown}
          nowIso={nowIso}
          spine={spine}
          prize={prize}
          isPrivate={arena.isPrivate}
        />

        <ArenaPhaseline
          status={status}
          nowIso={nowIso}
          registrationStart={arena.registrationStart}
          registrationEnd={arena.registrationEnd}
          ideaPhaseStart={arena.ideaPhaseStart}
          ideaPhaseEnd={arena.ideaPhaseEnd}
          implPhaseStart={arena.implPhaseStart}
          implPhaseEnd={arena.implPhaseEnd}
        />

        <ArenaContainer className="relative z-10 py-10 md:py-12">
          {status === "CANCELED" && (
            <p className="mb-8 border-l-4 border-accent bg-card px-5 py-4 font-sans text-sm leading-relaxed text-foreground">
              <strong className="font-bold">This arena was called off.</strong> The
              page stays up so anyone who entered can see what happened.
            </p>
          )}

          {/* The brief comes first and comes wide, on paper rather than in a
              card. It is the reason anyone opened this page, and boxing it at
              the same weight as "Where" and "Hand in" was most of why the page
              read as a listing: seven identical panels, one of which happened
              to contain the writing. */}
          <article className="mb-12 max-w-[68ch]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.28em] text-orange-ink">
                The brief
              </span>
              <span aria-hidden className="h-px flex-1 bg-foreground/15" />
            </div>

            <div className="mt-5">
              <ArenaBrief markdown={arena.description} />
            </div>

            {/* Rules sit on the card ground rather than on paper, which is the
                whole distinction: the brief is writing, the rules are
                reference. Nobody reads house rules top to bottom - they check
                them - so they get a box, a smaller size and markers. */}
            {arena.rulesText.trim().length > 0 && (
              <aside className="mt-8 border border-foreground/15 bg-card">
                <h2 className="border-b border-foreground/12 px-5 py-2.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-foreground/70">
                  House rules
                </h2>
                <div className="px-5 py-4">
                  <ArenaBrief markdown={arena.rulesText} variant="rules" />
                </div>
              </aside>
            )}
          </article>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className="flex flex-col gap-6">
              <ArenaActionPanel
                arenaId={arena.id}
                arenaTitle={arena.title}
                slug={arena.slug}
                relationship={viewer.relationship}
                status={status}
                isPrivate={arena.isPrivate}
                entrantCount={arena.entrantCount}
                maxParticipants={arena.maxParticipants}
                isTeam={arena.isTeam}
                isEditable={!hasRun && status !== "CANCELED"}
              />

              <DetailPanel title="Hand in" aside={`${deliverables.length}`}>
                {deliverables.length === 0 ? (
                  <p className="px-4 py-4 font-sans text-[0.8rem] text-foreground/60">
                    Nothing beyond turning up and demoing.
                  </p>
                ) : (
                  <ul className="divide-y divide-foreground/10">
                    {deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-foreground"
                      >
                        {/* The repo's own convention: a mark and a word, never
                            colour alone. */}
                        <span className="font-mono text-[0.6rem] font-bold text-orange-ink">
                          [✓]
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </DetailPanel>

              {(!isOnline || arena.googleMapsUrl) && (
                <DetailPanel title="Where">
                  <FactList>
                    {arena.locationName && <Fact label="Venue">{arena.locationName}</Fact>}
                    {arena.googleMapsUrl && (
                      <Fact label="Map">
                        <a
                          href={arena.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                        >
                          Open in Maps
                        </a>
                      </Fact>
                    )}
                  </FactList>
                </DetailPanel>
              )}

              {prize && (
                <DetailPanel title="Prize" accent>
                  <FactList>
                    <Fact label="Pool">{prize}</Fact>
                    {places.map(([place, amount]) => (
                      <Fact key={place} label={place}>
                        {amount.toLocaleString()} {arena.prizeCurrency}
                      </Fact>
                    ))}
                    {arena.prizeDisbursementTerms && (
                      <Fact label="Terms">{arena.prizeDisbursementTerms}</Fact>
                    )}
                  </FactList>
                  {/* PRD 7.2 makes this required copy wherever a prize appears,
                      and until now no prize appeared on this page at all. */}
                  <p className="border-t border-foreground/10 px-4 py-3 font-sans text-[0.72rem] leading-relaxed text-foreground/60">
                    Prize money, tax and payout are handled by whoever is running
                    this arena. Devs Arena runs the clock and the board, and never
                    holds the money.
                  </p>
                </DetailPanel>
              )}
            </aside>

            <div className="flex min-w-0 flex-col gap-8">
              <ArenaParticipants participants={arena.participants} isTeam={arena.isTeam} />

              {hasRun && <ArenaLeaderboard arenaId={arena.id} />}

              {invitations?.ok && (
                <ArenaHostSections
                  arenaId={arena.id}
                  arenaTitle={arena.title}
                  hostId={viewerUser!.id}
                  entrantCount={arena.entrantCount}
                  invitations={invitations.data.map((i) => ({
                    id: i.id,
                    status: i.status,
                    createdAt: i.createdAt.toISOString(),
                    receiver: {
                      id: i.receiver.id,
                      fullName: i.receiver.fullName,
                      handle: i.receiver.handle,
                      avatarUrl: i.receiver.avatarUrl,
                    },
                  }))}
                  inviteCode={arena.inviteCode ?? null}
                  isPrivate={arena.isPrivate}
                  canStillInvite={registrationOpen}
                  canCancel={!hasRun && status !== "CANCELED"}
                />
              )}
            </div>
          </div>

          {/* Last, and across the whole rail.

              It sat in the right-hand column beside a sidebar, which gave a
              threaded discussion about two thirds of the page to indent
              replies into - and put it above the host's own sections, so a
              host scrolled past everyone else's comments to reach their
              invitation roster. Comments are what you read after the page,
              not part of it. */}
          <section className="mt-12 border-t-2 border-foreground pt-10">
            <ArenaComments arenaId={arena.id} />
          </section>
        </ArenaContainer>
      </main>
    </>
  );
}
