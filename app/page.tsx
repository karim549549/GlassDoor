import { Billboard } from "@/components/home/Billboard";
import { HeroAndArenas } from "@/components/home/HeroAndArenas";
import { Footer } from "@/components/home/Footer";
import { AuthModalMount } from "@/components/auth/AuthModalMount";
import { Suspense } from "react";
import { listArenas, getBoardSummary } from "@/lib/arena/service";
import { getGlobalStandings } from "@/lib/arena/leaderboard-service";
import { toArenaCardData } from "@/components/home/Hero/arena-cards-data";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Organization + WebSite, the two entities a homepage is expected to declare.
 *
 * This is also the highest-leverage thing on the page for being cited by an
 * assistant rather than only ranked by a crawler: a language model summarising
 * "what is Devs Arena" reads a declared entity far more reliably than it infers
 * one from scroll-animated prose.
 *
 * Two deliberate omissions. No `SearchAction` - /arena takes no search query
 * parameter, and structured data pointing at a URL that does not work is worse
 * than none. No `sameAs` - the footer's social links are placeholders because
 * the accounts do not exist yet, and asserting profiles that aren't there is
 * exactly the kind of claim this product exists to make unnecessary.
 */
function buildJsonLd(siteUrl: string) {
  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Devs Arena",
    url: siteUrl,
    description:
      "Devs Arena runs community coding challenges in Egypt: anyone can post a brief, teams get thirty minutes to plan and four hours to build, and working engineers judge the entries and explain their reasoning in writing. Free to enter, online or in person in Cairo.",
    areaServed: { "@type": "Country", name: "Egypt" },
    knowsAbout: [
      "Hackathons",
      "Team coding challenges",
      "Competitive programming",
      "Developer community events",
      "Code review and judging",
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Devs Arena",
        description:
          "Community team hackathons and coding challenges in Egypt. Free to enter.",
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };
}

/**
 * Five minutes, not the hour this page used to cache for: the arena cards show
 * live countdowns, and an hour-stale "24 HOURS" is worse than none. Still
 * cached, so the database is not hit per visitor.
 */
export const revalidate = 300;

/**
 * The three cards the hero stack docks with.
 *
 * Arenas taking entries come first, topped up with whatever is mid-flight.
 * Public only - a private arena has an invite code precisely so that it does
 * not appear on a public homepage.
 *
 * Calls the service directly rather than fetching `/api/arena`: the documented
 * exception in AGENTS.md for statically-generated pages, which have no server
 * to self-fetch from at build time.
 */
async function loadHeroCards(now: Date) {
  try {
    const base = { page: 1, access: "public" as const, sortBy: "newest" as const, tab: "all" as const, search: "", now };

    const open = await listArenas({ ...base, limit: 6, status: "open" });
    const picked = [...open.arenas];

    if (picked.length < 6) {
      // The "open" and "active" filters overlap - a registration-open arena
      // satisfies both - so the top-up has to exclude what is already on the
      // deck, or the same arena docks in all three slots. Over-fetch and dedupe
      // by id rather than trusting the counts to line up.
      const seen = new Set(picked.map((a) => a.id));
      const active = await listArenas({ ...base, limit: 6, status: "active" });
      for (const a of active.arenas) {
        if (picked.length >= 6) break;
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        picked.push(a);
      }
    }

    // `total` here is the real count of public arenas taking entries - it feeds
    // the hero's headline figure, which used to be a hardcoded "312".
    return { cards: picked.map((a) => toArenaCardData(a, now)), openCount: open.total };
  } catch {
    // If the database is unreachable or offline during CI prerender, fall back to placeholder cards
    return { cards: [], openCount: 0 };
  }
}

export default async function Home() {
  // Resolved once and threaded into every status derivation below, so an arena
  // sitting on a phase boundary cannot derive two different states.
  const now = new Date();
  const [{ cards, openCount }, summary, standings] = await Promise.all([
    loadHeroCards(now),
    getBoardSummary(now).catch(() => null),
    getGlobalStandings(12).catch(() => []),
  ]);

  return (
    // `overflow-x-clip`, not `overflow-x-hidden`. `hidden` makes this element a
    // scroll container, which silently disables `position: sticky` for every
    // descendant - that is what stopped the directive section from holding.
    // `clip` hides the same horizontal overflow (the cards translate +/-500px
    // during the docking sequence) without creating one.
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-clip">
      <script
        type="application/ld+json"
        // Escaped through serializeJsonLd - see lib/json-ld.ts for why raw
        // JSON.stringify is not safe inside a <script> block.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd(getSiteUrl())) }}
      />
      {/* Editorial Background Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#landing-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Billboard />
        {/* The homepage was the only route in the app without a <main>. It is
            what assistive tech, reader modes and content extractors use to
            separate the page's substance from its chrome - and this is the one
            page most likely to be read by something other than a browser. */}
        <main className="flex flex-col">
          <HeroAndArenas cards={cards} openCount={openCount} summary={summary} standings={standings} />
        </main>
        <Footer />
      </div>

      <Suspense fallback={null}>
        <AuthModalMount />
      </Suspense>
    </div>
  );
}
