import Link from "next/link";
import Image from "next/image";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { ArenaCountdown } from "./ArenaCountdown";
import { authorityBadge } from "./panels";

/**
 * The arena's own hero, and the reason this page stopped reading as a listing.
 *
 * It used `PageMasthead` — the shared band the board and the create form
 * wear — so the one page about one specific arena opened with the same
 * furniture as the page listing fifty of them. Consistency is worth a lot, and
 * it was worth exactly this much: the tokens stay (ink ground, blueprint grid,
 * orange rule, display italic), the composition does not.
 *
 * What is different is what an arena actually is: a brief with a clock on it.
 * So the title takes the left and the clock takes the right, at a weight
 * nothing else on the site carries, and the spine of facts runs under both on
 * a hairline. A reader who lands here knows in one glance what it is, who is
 * running it, and how long they have to decide.
 */

export interface ArenaMastheadProps {
  title: string;
  statusLabel: string;
  authority: string;
  host: { name: string; handle: string | null; avatarUrl: string | null };
  /** The one clock that matters right now, or null once nothing is pending. */
  countdown: { target: string; label: string } | null;
  nowIso: string;
  /** Short mono facts for the spine: place, entry shape, difficulty. */
  spine: string[];
  /** Rendered in the accent, because money is the fact people scan for. */
  prize: string | null;
  isPrivate: boolean;
}

export function ArenaMasthead({
  title,
  statusLabel,
  authority,
  host,
  countdown,
  nowIso,
  spine,
  prize,
  isPrivate,
}: ArenaMastheadProps) {
  const tier = authorityBadge(authority);

  return (
    <header className="relative w-full overflow-hidden border-b-2 border-orange bg-foreground text-background">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(224,94,24,0.16),transparent_45%,rgba(224,94,24,0.07))]"
      />
      <BackgroundGrid opacity={0.07} patternSize={28} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 pt-12 md:px-10 md:pb-8 md:pt-16">
        {/* Title left, clock right. The asymmetry is the point: a single
            centred column is what every other band on the site does. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-orange px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.22em] text-orange">
                {statusLabel}
              </span>
              {tier && (
                <span
                  className={`border px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.22em] ${
                    authority === "OFFICIAL"
                      ? "border-orange bg-orange text-[#0E0E0D]"
                      : "border-background bg-background text-foreground"
                  }`}
                >
                  {tier.label}
                </span>
              )}
              {isPrivate && (
                <span className="border border-background/40 px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.22em] text-background/70">
                  Invite only
                </span>
              )}
            </div>

            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.1rem,5.4vw,4rem)] italic leading-[1.02] text-background">
              {title}
            </h1>

            {/* The host, with a face. An arena is something a person is
                running, and the previous page said so in 0.55rem grey. */}
            <div className="mt-5 flex items-center gap-2.5">
              {host.avatarUrl ? (
                <Image
                  src={host.avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 border border-background/25 object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-background/25 bg-background/10 font-mono text-xs font-bold uppercase text-background/70"
                >
                  {host.name.replace(/^@/, "").charAt(0)}
                </span>
              )}
              <span className="font-sans text-sm text-background/75">
                Run by{" "}
                {host.handle ? (
                  <Link
                    href={`/u/${host.handle}`}
                    className="font-semibold text-background underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                  >
                    {host.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-background">{host.name}</span>
                )}
              </span>
            </div>
          </div>

          {countdown && (
            <ArenaCountdown
              target={countdown.target}
              label={countdown.label}
              nowIso={nowIso}
            />
          )}
        </div>
      </div>

      {/* The spine. One hairline, one line of facts, edge to edge - the thing
          that makes the band read as a masthead rather than a title card. */}
      <div className="relative z-10 border-t border-background/15">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-background/65 md:px-10">
          {/* Slashes as separators, in the accent. They are the only ornament
              on the band and they do a job: at this size the facts would
              otherwise run together into one grey line. */}
          {spine.map((fact, i) => (
            <span key={fact} className="contents">
              {i > 0 && (
                <span aria-hidden className="text-orange">
                  /
                </span>
              )}
              <span>{fact}</span>
            </span>
          ))}
          {prize && (
            <>
              <span aria-hidden className="text-orange">
                /
              </span>
              <span className="font-bold text-orange">{prize}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default ArenaMasthead;
