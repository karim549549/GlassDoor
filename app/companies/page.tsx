import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { Footer } from "@/components/home/Footer";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { PacketAnatomy } from "@/components/companies/PacketAnatomy";
import { GUARANTEES, LIMITS } from "@/components/companies/hiring-content";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";

/**
 * /companies - the public employer page.
 *
 * This URL was linked from two CTAs on the homepage and returned 404, so the
 * entire recruiter conversion path dead-ended. It also filled a structural gap:
 * /recruiter is the real product but is auth-gated and `noindex`, and the
 * homepage speaks to developers, which left nothing public and indexable
 * addressed to the people who pay.
 *
 * It makes no claim about scale - no customer count, no developer count, no
 * benchmark. See the note in hiring-content.ts for why that is a deliberate
 * constraint rather than an omission.
 */

const TITLE = "Hire developers from judged work, not CVs";
const DESCRIPTION =
  "See what a candidate actually built under a clock, scored against a rubric frozen before entry by named judges. Every result is a public, tamper-evident proof packet you can open without an account.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/companies" },
  openGraph: {
    type: "website",
    title: `${TITLE} | Devs Arena`,
    description: DESCRIPTION,
    url: "/companies",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Devs Arena`,
    description: DESCRIPTION,
  },
};

/**
 * The limits section is genuinely question-and-answer and visible on the page,
 * which is what makes FAQPage schema honest here rather than markup bolted onto
 * prose. Google restricted FAQ rich results to a narrow set of sites in 2023,
 * so this is not expected to change the search listing - it is here because
 * assistants and AI search read structured data far more reliably than they
 * infer meaning from layout, and these five answers are exactly what a hiring
 * team asks.
 */
function buildJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/companies#faq`,
    mainEntity: LIMITS.map((l) => ({
      "@type": "Question",
      name: l.question,
      acceptedAnswer: { "@type": "Answer", text: l.answer },
    })),
  };
}

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd(getSiteUrl())) }}
      />

      <main>
        {/* ---------------------------------------------------------------
            Hero. The claim, then immediately the artifact that backs it -
            rather than a headline sitting over a gradient with the evidence
            three scrolls down.
        ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-foreground/15">
          <BackgroundGrid opacity={0.08} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
            <Reveal as="div" className="max-w-3xl">
              <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
                [ For hiring teams ]
              </span>
              <h1 className="mt-3 font-display italic text-[clamp(2.2rem,5.5vw,4.6rem)] uppercase leading-[1.0] text-balance">
                Read the work,
                <br />
                not the CV
              </h1>
              <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-foreground/75">
                A CV is a claim about the past that nobody checked. An arena is a
                timed problem, built in public, scored against a rubric that was
                fixed before anyone entered, by judges who are named and who
                cannot score their own team.
              </p>
              <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-foreground/75">
                What you get is not a percentile. It is a document.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  href="/arena"
                  className="group flex items-center gap-3 border-2 border-orange bg-orange px-7 py-4 text-[#0E0E0D] shadow-[5px_5px_0_0_var(--foreground)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                >
                  <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em]">
                    Browse the board
                  </span>
                  <span className="font-mono text-[0.9rem] leading-none transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
                <Link
                  href="/arena/create"
                  className="border-b border-current/30 pb-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground/70 transition-all hover:text-orange"
                >
                  Or set the problem yourself
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            The signature: the credential, dissected.
        ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-foreground/15">
          <BackgroundGrid opacity={0.06} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
            <Reveal as="div" className="max-w-2xl">
              <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
                [ 01 / What you receive ]
              </span>
              <h2 className="mt-3 font-display italic text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.05] text-balance">
                Inside a proof packet
              </h2>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-foreground/75">
                One public link, readable without an account, that opens the same
                way for you as for anyone else the candidate sends it to. These
                are the actual fields it carries.
              </p>
            </Reveal>

            <Reveal className="mt-12">
              <PacketAnatomy />
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            Guarantees. Each names where it is enforced, because "we promise"
            is what every competitor already says.
        ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-foreground/15 bg-foreground text-background">
          <BackgroundGrid opacity={0.07} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
            <Reveal as="div" className="max-w-2xl">
              <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
                [ 02 / Why it holds ]
              </span>
              <h2 className="mt-3 font-display italic text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.05] text-balance">
                Constraints, not promises
              </h2>
              <p className="mt-5 text-[0.95rem] leading-relaxed opacity-75">
                Anyone can say their scoring is fair. These are the places where
                it stops being a matter of trust.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-px border border-current/20 bg-current/20 md:grid-cols-2">
              {GUARANTEES.map((g, i) => (
                <Reveal
                  as="li"
                  key={g.claim}
                  delay={i * 80}
                  className="relative bg-foreground p-6 md:p-8"
                >
                  <h3 className="font-display text-[1.25rem] leading-tight text-balance">
                    {g.claim}
                  </h3>
                  <p className="mt-3 text-[0.88rem] leading-relaxed opacity-70">
                    {g.mechanism}
                  </p>
                  <p className="mt-4 border-t border-current/20 pt-3 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-orange">
                    {g.enforcement}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            Honest limits. No competitor publishes one; that is the reason to.
        ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-foreground/15">
          <BackgroundGrid opacity={0.06} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
            <Reveal as="div" className="max-w-2xl">
              <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-accent">
                [ 03 / Where it stops ]
              </span>
              <h2 className="mt-3 font-display italic text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.05] text-balance">
                What this cannot tell you
              </h2>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-foreground/75">
                A screening tool that claims to answer everything is telling you
                something about itself. Here is the boundary, before you spend
                time finding it.
              </p>
            </Reveal>

            <dl className="mt-12 border-t border-foreground/15">
              {LIMITS.map((l, i) => (
                <Reveal
                  key={l.question}
                  delay={i * 60}
                  className="grid gap-x-8 gap-y-2 border-b border-foreground/15 py-6 md:grid-cols-[minmax(0,22rem)_1fr]"
                >
                  <dt className="font-display text-[1.15rem] leading-tight text-pretty hyphens-none">
                    {l.question}
                  </dt>
                  <dd className="text-[0.9rem] leading-relaxed text-foreground/75">
                    {l.answer}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            Two ways in. Reading judged work needs nothing from them; setting
            the problem is the committed path.
        ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <BackgroundGrid opacity={0.06} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
            <Reveal as="div" className="max-w-2xl">
              <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
                [ 04 / Start ]
              </span>
              <h2 className="mt-3 font-display italic text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.05] text-balance">
                Two ways in
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-2">
              <Reveal className="bg-background p-7 md:p-9">
                <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.2em] text-foreground/45">
                  No account needed
                </span>
                <h3 className="mt-3 font-display text-[1.5rem] leading-tight">
                  Read what is already there
                </h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-foreground/75">
                  Open the board, look at the arenas and the work entered into
                  them, and judge for yourself whether the evidence is worth
                  hiring on before you commit anything.
                </p>
                <Link
                  href="/arena"
                  className="mt-6 inline-block border-b border-orange/40 pb-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-orange transition-colors hover:border-orange"
                >
                  Browse the board &rarr;
                </Link>
              </Reveal>

              <Reveal delay={90} className="bg-background p-7 md:p-9">
                <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.2em] text-foreground/45">
                  For a role you are filling
                </span>
                <h3 className="mt-3 font-display text-[1.5rem] leading-tight">
                  Set the problem yourself
                </h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-foreground/75">
                  Host an arena around work you actually need done. You choose the
                  brief, the clock and the deliverables, and you can change the
                  requirements partway through to see who adapts.
                </p>
                <Link
                  href="/arena/create"
                  className="mt-6 inline-block border-b border-orange/40 pb-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-orange transition-colors hover:border-orange"
                >
                  Host an arena &rarr;
                </Link>
              </Reveal>
            </div>

            <Reveal className="mt-10">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-foreground/55">
                Questions first?{" "}
                <Link href="/support" className="text-orange hover:underline">
                  Talk to us &rarr;
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
