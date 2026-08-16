import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage, Block } from "@/components/site/StaticPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Devs Arena runs team coding challenges in Egypt: a strange brief, thirty minutes to plan, four hours to build, and a working engineer who tells you what they thought.",
  alternates: { canonical: "/about" },
};

/**
 * Rewritten for the audience that actually arrives. The previous version opened
 * on broken hiring and ended on proof packets, which is the pitch for the side
 * of the business that is not yet for sale - see PRD 1.2 and 1.4. Developers
 * never pay; they are the reason the thing exists at all.
 *
 * The credential is still described, because it is real and someone reading an
 * about page deserves the whole picture. It just is not the first thing, or the
 * reason to turn up.
 */
export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="Build something strange, fast"
      standfirst="Devs Arena is a community coding challenge board. Somebody posts a brief with no business existing, a few teams get four hours to build it, and a working engineer says what they thought. Free to enter, in Cairo or online."
    >
      <Block heading="What it is">
        <p>
          A challenge starts with a brief &mdash; ideally one that should not
          exist. A game you need two phones to play. The most inconvenient
          possible login flow. An app that only works before 9am.
        </p>
        <p>
          Everybody opens it at the same moment. You get thirty minutes to plan
          and four hours to build, alone or in a team of up to four, and when the
          clock dies you show what you have. That is the whole format.
        </p>
      </Block>

      <Block heading="Where the idea came from">
        <p>
          The shape is borrowed from{" "}
          <a
            href="https://codetv.dev/series/web-dev-challenge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange underline underline-offset-4 hover:no-underline"
          >
            CodeTV&rsquo;s Web Dev Challenge
          </a>
          , which is a show worth watching and has nothing to do with us. The
          difference is that a show has an invited cast, and this does not: you
          can enter one, and you can start one, without asking anybody.
        </p>
        <p>
          You can also run it in a room. Arenas can be hosted at a physical venue
          in Egypt rather than only online, because a lot of the point is the
          people in the room with you.
        </p>
      </Block>

      <Block heading="Why a human does the judging">
        <p>
          An autograder tells you a test passed. It cannot tell you that your
          idea was better than your execution, or that the ugly thing you shipped
          at 04:29 was the most interesting entry of the day.
        </p>
        <p>
          So entries are read by working engineers who put their name on a
          verdict and write down their reasoning. You are allowed to disagree
          with them, out loud, and appeals are answered in public.
        </p>
      </Block>

      <Block heading="The rules that keep it fair">
        <p>
          The scoring rubric is fixed before entry opens, so it cannot be shaped
          around a result somebody liked. A judge cannot score their own team
          &mdash; that one is enforced in the database rather than by policy, so
          it holds even if somebody tries to route around the app.
        </p>
        <p>
          None of this is the reason to enter. It is the plumbing that means the
          board is worth looking at.
        </p>
      </Block>

      <Block heading="What you keep afterwards">
        <p>
          If you want it, each judged entry leaves you a page recording the
          brief, your commits, and what each judge said. It is public, it opens
          without an account, and it carries a hash of its own contents so an
          edited score is detectable by anyone &mdash; including when the person
          editing would be us.
        </p>
        <p>
          Some people will send that to an employer one day. That is fine, and it
          is not what the Saturday is for. Think of it as the receipt.
        </p>
      </Block>

      <Block heading="Where we are">
        <p>
          Cairo, and early. We would rather say that plainly than quote numbers
          we have not earned yet.
        </p>
        <p>
          If you want to enter something,{" "}
          <Link href="/arena" className="text-orange underline underline-offset-4 hover:no-underline">
            the board is here
          </Link>
          . If you have an idea too stupid not to build,{" "}
          <Link
            href="/arena/create"
            className="text-orange underline underline-offset-4 hover:no-underline"
          >
            write the brief
          </Link>{" "}
          and see who turns up. If you are a company thinking about hiring from
          it,{" "}
          <Link
            href="/companies"
            className="text-orange underline underline-offset-4 hover:no-underline"
          >
            that is over here
          </Link>
          .
        </p>
      </Block>
    </StaticPage>
  );
}
