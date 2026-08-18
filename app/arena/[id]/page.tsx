import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildArenaSlug, extractUuidFromSlug } from "@/lib/arena-slug";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getArenaDetail } from "@/lib/arena/service";
import { listInvitationsForArena } from "@/lib/arena/invitation-service";
import { resolveViewer, toArenaDetailDto } from "@/lib/arena/dto";
import { deriveArenaStatus } from "@/lib/arena/status";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { PageMasthead } from "@/components/site/PageMasthead";
import { ClockRibbon } from "@/components/arena/create/ClockRibbon";
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
  authorityBadge,
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

const loadArena = cache((uuid: string, viewerId: string | null) =>
  getArenaDetail(uuid, viewerId)
);

function toMetaText(description: string, maxLength: number): string {
  return description.replace(/[#*`>]/g, "").slice(0, maxLength).trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
  const result = uuid ? await loadArena(uuid, null) : null;

  if (!result) {
    return { title: "Arena Not Found" };
  }

  const { arena } = result;
  const cleanDescription = toMetaText(arena.description, 160);
  const canonicalUrl = `${getSiteUrl()}/arena/${buildArenaSlug(arena.title, arena.id)}`;

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

const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export default async function ArenaDetailPage({ params }: PageProps) {
  const { id: slugParam } = await params;
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

  const viewerUser = await getOptionalUser();
  const result = uuid ? await loadArena(uuid, viewerUser?.id ?? null) : null;

  if (!result) {
    notFound();
  }

  const { arena: raw, meta } = result;
  const now = new Date();
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

  const canonicalUrl = `${getSiteUrl()}/arena/${buildArenaSlug(arena.title, arena.id)}`;
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

  const tier = authorityBadge(arena.authority);
  const statusCopy = STATUS_COPY[status] ?? { label: status, tone: "past" as const };
  const hostName = arena.creator.fullName ?? (arena.creator.handle ? `@${arena.creator.handle}` : "A host");

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

        <PageMasthead eyebrow={statusCopy.label} title={arena.title}>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-background/70">
            {/* The tier, which this page never showed at all - and which is
                the difference between an arena that carries rating and prize
                money and one that does not. */}
            {tier && (
              <span
                className={`border px-2 py-0.5 font-bold ${tier.className.replace("border-foreground bg-foreground text-background", "border-background bg-background text-foreground")}`}
              >
                {tier.label}
              </span>
            )}

            <span>
              By{" "}
              {arena.creator.handle ? (
                <Link
                  href={`/u/${arena.creator.handle}`}
                  className="text-background underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  {hostName}
                </Link>
              ) : (
                <span className="text-background">{hostName}</span>
              )}
            </span>

            <span>{isOnline ? "Online" : (arena.locationName ?? "In person")}</span>
            <span>{arena.isTeam ? `Teams of ${arena.minTeamSize}–${arena.maxTeamSize}` : "Solo"}</span>
            {arena.isPrivate && <span>Invite only</span>}
            {prize && <span className="text-orange">{prize}</span>}
          </div>
        </PageMasthead>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
          {status === "CANCELED" && (
            <p className="mb-6 border-2 border-accent bg-card px-4 py-3 font-sans text-sm leading-relaxed text-foreground">
              <strong className="font-bold">This arena was called off.</strong> The
              page stays up so anyone who entered can see what happened.
            </p>
          )}

          {/* Controls left, content right - the board's arrangement, so the two
              pages read as one site. It also puts the action panel first on a
              phone, where the column stacks and the thing you came to press
              should not be below the brief. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
            <aside className="flex flex-col gap-6">
              <ArenaActionPanel
                arenaId={arena.id}
                arenaTitle={arena.title}
                relationship={viewer.relationship}
                status={status}
                isPrivate={arena.isPrivate}
                entrantCount={arena.entrantCount}
                maxParticipants={arena.maxParticipants}
                isTeam={arena.isTeam}
                isEditable={!hasRun && status !== "CANCELED"}
              />

              <DetailPanel title="The day">
                <div className="px-4 py-4">
                  <ClockRibbon
                    registrationStart={arena.registrationStart}
                    registrationEnd={arena.registrationEnd}
                    ideaPhaseEnd={arena.ideaPhaseEnd}
                    implPhaseEnd={arena.implPhaseEnd}
                  />
                </div>
                <FactList>
                  <Fact label="Registration closes">
                    {DATE.format(new Date(arena.registrationEnd))} UTC
                  </Fact>
                  <Fact label="Build starts">
                    {DATE.format(new Date(arena.implPhaseStart))} UTC
                  </Fact>
                  <Fact label="Submissions lock">
                    {DATE.format(new Date(arena.implPhaseEnd))} UTC
                  </Fact>
                </FactList>
              </DetailPanel>

              <DetailPanel title="Where">
                <FactList>
                  <Fact label="Format">{isOnline ? "Online" : "In person"}</Fact>
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
                  <Fact label="Difficulty">{arena.difficulty.toLowerCase()}</Fact>
                </FactList>
              </DetailPanel>

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
              <section className="border border-foreground/15 bg-card p-6 md:p-8">
                <h2 className="mb-4 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-orange-ink">
                  The brief
                </h2>
                <ArenaBrief markdown={arena.description} />
              </section>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailPanel title="Hand in" aside={`${deliverables.length}`}>
                  {deliverables.length === 0 ? (
                    <p className="px-4 py-4 font-sans text-[0.8rem] text-foreground/60">
                      Nothing required beyond turning up and demoing.
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

                <DetailPanel title="Who can enter">
                  <FactList>
                    <Fact label="Entry">
                      {arena.isTeam
                        ? `Teams of ${arena.minTeamSize} to ${arena.maxTeamSize}`
                        : "Solo"}
                    </Fact>
                    <Fact label="Seats">
                      {arena.maxParticipants
                        ? `${arena.entrantCount} of ${arena.maxParticipants} taken`
                        : `${arena.entrantCount} in, no cap`}
                    </Fact>
                    <Fact label="Access">
                      {arena.isPrivate ? "Invite only" : "Open to anyone"}
                    </Fact>
                  </FactList>
                </DetailPanel>
              </div>

              {arena.rulesText.trim().length > 0 && (
                <section className="border border-foreground/15 bg-card p-6 md:p-8">
                  <h2 className="mb-4 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-foreground/70">
                    Rules
                  </h2>
                  <ArenaBrief markdown={arena.rulesText} />
                </section>
              )}

              <ArenaParticipants participants={arena.participants} isTeam={arena.isTeam} />

              {hasRun && <ArenaLeaderboard arenaId={arena.id} />}

              <ArenaComments arenaId={arena.id} />

              {invitations?.ok && (
                <ArenaHostSections
                  arenaId={arena.id}
                  invitations={invitations.data.map((i) => ({
                    id: i.id,
                    status: i.status,
                    createdAt: i.createdAt.toISOString(),
                    receiver: {
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
        </div>
      </main>
    </>
  );
}
