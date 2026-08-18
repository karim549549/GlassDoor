import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage, Block } from "@/components/site/StaticPage";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with an arena, a submission, a score, or a proof packet - and how to appeal a result.",
  alternates: { canonical: "/support" },
};

/**
 * Support routes are listed by what the reader is trying to do, not by our
 * internal team structure. Someone whose submission failed does not know
 * whether that is engineering, judging or moderation, and should not have to.
 */
const ROUTES = [
  {
    when: "An arena, a submission, or an upload is broken",
    what: "Report it with the arena name and roughly when it happened. If a submission failed, say what you were uploading and how large it was.",
    action: "support@devsarena.eg",
    href: "mailto:support@devsarena.eg",
  },
  {
    when: "You disagree with a score",
    what: "Do not email about this - it goes through appeals, so the answer is public and attached to the packet. One appeal per submission.",
    action: "Open the submission and appeal",
    href: "/arena",
  },
  {
    when: "You want to run an arena around your own problem",
    what: "Tell us the problem, roughly how long entrants should have, and whether there is a prize pool.",
    action: "hosting@devsarena.eg",
    href: "mailto:hosting@devsarena.eg",
  },
  {
    when: "You want to hire from the board",
    what: "We will walk you through what a proof packet contains and what it does not.",
    action: "hiring@devsarena.eg",
    href: "mailto:hiring@devsarena.eg",
  },
  {
    when: "Something about your data, or you want your account removed",
    what: "Say which account. Deletion is permanent and we will tell you what it does and does not remove first.",
    action: "privacy@devsarena.eg",
    href: "mailto:privacy@devsarena.eg",
  },
] as const;

export default function SupportPage() {
  return (
    <StaticPage
      eyebrow="Support"
      title="Getting help"
      standfirst="Pick the line that matches what you are trying to do. Scores are the one thing that does not go through email - those go through appeals so the answer is public."
    >
      <div className="space-y-px border-y border-border">
        {ROUTES.map((r) => (
          <div key={r.when} className="border-b border-border py-5 last:border-b-0">
            <h2 className="font-display text-[1.15rem] leading-tight">{r.when}</h2>
            <p className="text-[0.875rem] leading-relaxed text-foreground/70 mt-2">{r.what}</p>
            <Link
              href={r.href}
              className="inline-block mt-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.18em] text-orange border-b border-orange/40 pb-0.5 hover:border-orange transition-colors"
            >
              {r.action}
            </Link>
          </div>
        ))}
      </div>

      <Block heading="Response times">
        <p>
          We are early and small, so this is a description rather than a
          guarantee: most things get a reply within two working days, and
          anything that blocks an arena in progress is picked up first.
        </p>
      </Block>

      <Block heading="Reporting conduct">
        <p>
          Cheating, harassment, or a judge behaving improperly should go to{" "}
          <Link href="mailto:conduct@devsarena.eg" className="text-orange underline underline-offset-4 hover:no-underline">
            conduct@devsarena.eg
          </Link>
          . Include the arena and, if you can, links. Reports about a judge are
          never routed to that judge.
        </p>
      </Block>
    </StaticPage>
  );
}
