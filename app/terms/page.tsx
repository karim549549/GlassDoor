import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage, Block, DraftNotice } from "@/components/site/StaticPage";

export const metadata: Metadata = {
  title: "Terms | Devs Arena",
  description:
    "The rules for competing, judging, and hosting on Devs Arena - including what happens to your work and how results are decided.",
};

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Terms"
      title="The rules of the arena"
      standfirst="What you agree to by competing, judging, or hosting here - written to be read rather than to be survived."
      updated="16 August 2026"
    >
      <DraftNotice />

      <Block heading="Who can compete">
        <p>
          You need an account and you must be old enough to enter a contract
          where you live. One account per person. Entering an arena on behalf of
          someone else, or letting someone else work under your name, is
          grounds for removal of the result.
        </p>
      </Block>

      <Block heading="Your work stays yours">
        <p>
          You keep ownership and copyright of everything you build in an arena.
          Hosting an arena does not transfer your work to the host, and entering
          one does not transfer it to us.
        </p>
        <p>
          You do grant us permission to display your submission, your commit
          history, your defense recording and your scores within a proof packet
          and on the platform, because that publication is the credential. If a
          host wants rights beyond that, they must state it in the arena rules
          before entry.
        </p>
      </Block>

      <Block heading="How results are decided">
        <p>
          Judging is against a rubric published before entry, which cannot be
          edited afterwards. Judges are named, must give written reasoning per
          criterion, and cannot score a submission from their own team &mdash; a
          restriction enforced in the database.
        </p>
        <p>
          You may appeal once per submission. Appeals are answered in public and
          attached to the record. Once results are published the scores are
          frozen; corrections are made by issuing a new version of a packet, not
          by quietly editing the old one.
        </p>
      </Block>

      <Block heading="What is not allowed">
        <p>
          Submitting work you did not do. Coordinating with another entrant to
          split a problem in a solo arena. Attacking the platform, the runner,
          or another entrant&rsquo;s submission. Misrepresenting a proof packet
          &mdash; including presenting a revoked one as current.
        </p>
        <p>
          Using AI tools is not banned. Passing off output you cannot explain is
          a different matter, and is exactly what the defense and process
          criteria in every rubric are there to catch.
        </p>
      </Block>

      <Block heading="Prizes">
        <p>
          Where an arena has a prize pool, the amounts, the currency and the
          payment terms are set by whoever hosts it and shown on the arena
          before you enter. The host pays, not us, unless the arena says
          otherwise. We do not take a cut of prize money.
        </p>
      </Block>

      <Block heading="Revoking a credential">
        <p>
          We can revoke a proof packet if a result was obtained by cheating or
          rests on a scoring error. A revoked packet keeps its link and renders
          as revoked rather than disappearing &mdash; a dead link on someone
          else&rsquo;s CV is worse for everybody than an honest one.
        </p>
      </Block>

      <Block heading="Where this stands">
        <p>
          These terms are governed by the laws of the Arab Republic of Egypt.
          Questions go to{" "}
          <Link href="mailto:legal@devsarena.eg" className="text-orange underline underline-offset-4 hover:no-underline">
            legal@devsarena.eg
          </Link>
          .
        </p>
      </Block>
    </StaticPage>
  );
}
