import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage, Block, DraftNotice } from "@/components/site/StaticPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Devs Arena collects, what it publishes, and what stays private - described from how the platform actually behaves.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Privacy"
      title="What we hold, and what is public"
      standfirst="This platform publishes work deliberately, so the important distinction is not what we store but what we show. That line is drawn below."
      updated="16 August 2026"
    >
      <DraftNotice />

      <Block heading="What is public by design">
        <p>
          A proof packet is a public document. When results are published it
          shows the arena, the work submitted, the rubric, each judge&rsquo;s
          score and reasoning, and the rating change. It has a permanent link
          that needs no account to open. That is the product; entering an arena
          is agreeing to it.
        </p>
        <p>
          Your public profile shows your display name, handle, avatar, bio,
          skills, and ratings per domain. It does <strong>not</strong> show your
          email address &mdash; that is excluded at the query layer, not merely
          hidden in the interface.
        </p>
      </Block>

      <Block heading="What we collect">
        <p>
          <strong>Account.</strong> Email address and authentication details,
          handled by Supabase Auth. Optionally a name, avatar, bio, links to
          GitHub, LinkedIn, or a portfolio, and your location at city level.
        </p>
        <p>
          <strong>Competition.</strong> Entries, team membership, submissions,
          the repository URL you provide and commit metadata synced from it,
          any defense recording you upload, and the scores and written
          reasoning judges attach to your work.
        </p>
        <p>
          <strong>Technical.</strong> Standard server logs, and IP address on
          administrative actions for audit purposes.
        </p>
      </Block>

      <Block heading="What we do not do">
        <p>
          We do not sell personal data. We do not run advertising or third-party
          tracking. We do not pass your contact details to a company because
          they asked &mdash; a recruiter reads your packet, and contact is
          gated on your own consent.
        </p>
      </Block>

      <Block heading="Who processes data for us">
        <p>
          Supabase (authentication, database, file storage), Vercel (hosting),
          and GitHub&rsquo;s API when you connect a repository so commits can be
          synced. Each sees only what it needs to do that job.
        </p>
      </Block>

      <Block heading="Deleting your account">
        <p>
          You can ask us to delete your account at{" "}
          <Link href="mailto:privacy@devsarena.eg" className="text-orange underline underline-offset-4 hover:no-underline">
            privacy@devsarena.eg
          </Link>
          . One honest caveat: a published proof packet is a record other people
          may have relied on when making a hiring decision, and judged results
          are not rewritten on request. We will tell you exactly what deletion
          removes and what remains before doing anything.
        </p>
      </Block>

      <Block heading="Contact">
        <p>
          Questions about any of this go to{" "}
          <Link href="mailto:privacy@devsarena.eg" className="text-orange underline underline-offset-4 hover:no-underline">
            privacy@devsarena.eg
          </Link>
          .
        </p>
      </Block>
    </StaticPage>
  );
}
