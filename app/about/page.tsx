import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage, Block } from "@/components/site/StaticPage";

export const metadata: Metadata = {
  title: "About | Devs Arena",
  description:
    "Devs Arena runs timed developer competitions in Egypt and turns the results into hiring credentials that can be checked by anyone.",
};

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="Build, not claim"
      standfirst="Devs Arena runs timed developer competitions and turns the results into a hiring credential that anyone can check, without taking our word for it."
    >
      <Block heading="The problem">
        <p>
          Hiring engineers runs on self-report. A CV claims five years of
          something, an interview samples an hour of it, and a take-home is
          unsupervised and unpaid. Everyone involved knows the signal is weak,
          which is why the process is so long.
        </p>
        <p>
          Meanwhile a developer with real ability and no network has almost no
          way to demonstrate it that a stranger will trust.
        </p>
      </Block>

      <Block heading="What we do about it">
        <p>
          Developers enter timed arenas and build under a clock. Named judges
          score the work against a rubric that was published before anyone
          started, and every score arrives with written reasoning attached.
        </p>
        <p>
          What comes out is a proof packet: a permanent public record of the
          brief, the commits, the scores, and who gave them. It is the artefact
          a developer can put on a CV and a company can open without an account.
        </p>
      </Block>

      <Block heading="Why it can be trusted">
        <p>
          The rubric is frozen before entry, so it cannot be shaped around a
          result. Judges are named and cannot score their own team &mdash; that
          restriction is enforced in the database, not by policy. Appeals are
          answered in public.
        </p>
        <p>
          Each packet publishes a hash of its own contents, so altering a score
          after issue is detectable by anyone, including when the person
          altering it would be us.
        </p>
      </Block>

      <Block heading="Where we are">
        <p>
          Cairo. The platform is early &mdash; we would rather say that plainly
          than quote numbers we have not earned yet.
        </p>
        <p>
          If you want to compete,{" "}
          <Link href="/arena" className="text-orange underline underline-offset-4 hover:no-underline">
            the board is here
          </Link>
          . If you want to hire from it or run an arena around your own problem,{" "}
          <Link href="/support" className="text-orange underline underline-offset-4 hover:no-underline">
            talk to us
          </Link>
          .
        </p>
      </Block>
    </StaticPage>
  );
}
