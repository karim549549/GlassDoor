/**
 * Copy for /companies - the public employer page.
 *
 * Deliberately makes no claim about scale: no customer count, no developer
 * count, no benchmark percentage. Every competitor in this category opens with
 * logos and numbers, and this platform has none of them yet. Inventing them
 * would destroy the exact thing being sold, and a recruiter who later found out
 * would be right to leave.
 *
 * What is left is the mechanism, which is the one thing that can be shown
 * honestly on day one - and which competitors can only describe, because their
 * output is a score while this one's is a document.
 *
 * The packet anatomy below mirrors `ProofPacketSnapshot` in
 * lib/proof/proof-service.ts field for field. If that interface changes, this
 * has to change with it: the page's whole argument is that what a recruiter
 * receives is exactly what is described here.
 */

export interface PacketSection {
  /** The key as it appears in the packet payload. */
  key: string;
  label: string;
  /** The fields carried under this key. */
  fields: string[];
  /** Why a hiring team should care, in their terms. */
  gloss: string;
}

export const PACKET_ANATOMY: PacketSection[] = [
  {
    key: "arena",
    label: "The brief they were given",
    fields: ["title", "domain", "difficulty", "format"],
    gloss:
      "The problem, its domain, and how hard it was - fixed before anyone entered. You are reading work against a known task, not a portfolio piece with no stated constraints.",
  },
  {
    key: "entrant",
    label: "Who did the work",
    fields: ["isTeam", "teamName", "members"],
    gloss:
      "Solo or team, and every member named. On a team entry you can see who they built alongside, which is usually the question a portfolio cannot answer.",
  },
  {
    key: "deliverables",
    label: "What they shipped",
    fields: ["githubUrl", "figmaUrl", "videoUrl", "writeupText"],
    gloss:
      "The repository, the design file where there was one, a recorded defense, and their own written account of the approach. You can open the code yourself.",
  },
  {
    key: "commits",
    label: "How it was built, in order",
    fields: ["sha", "message", "committedAt"],
    gloss:
      "Every commit with its timestamp, synced while the clock ran. The shape of the work is visible: steady progress, or everything arriving in one push at the end.",
  },
  {
    key: "evaluation",
    label: "What the judges said, and why",
    fields: ["finalScore", "verdicts[].scores[].criterionTitle", "criterionWeight", "score", "justification"],
    gloss:
      "Per criterion, per judge: the score, its weight in the rubric, and a written justification that cannot be left empty. You are reading reasoning, not a number.",
  },
  {
    key: "contentHash",
    label: "Proof it has not been edited",
    fields: ["contentHash", "issuedAt", "version"],
    gloss:
      "A SHA-256 over the canonical form of everything above. Change one character of any of it and the hash stops matching, which anyone can check.",
  },
];

export interface Guarantee {
  claim: string;
  mechanism: string;
  /** What makes it more than a promise. */
  enforcement: string;
}

/**
 * Each of these is enforced somewhere in the system rather than asserted in a
 * policy document, and each names where. That is the difference between a trust
 * claim and a verifiable one, and it is the whole product.
 */
export const GUARANTEES: Guarantee[] = [
  {
    claim: "The rubric was frozen before anyone started",
    mechanism:
      "Criteria and weights are versioned and immutable once an arena opens. Nobody can reshape the scoring around a result they liked.",
    enforcement: "Rubrics are write-once records, not editable settings.",
  },
  {
    claim: "A judge cannot score their own team",
    mechanism:
      "Assignment of a judge to a submission from their own team is rejected outright, not flagged for review afterwards.",
    enforcement:
      "A database trigger, so it holds even against a direct write or a backfill script that skips the application.",
  },
  {
    claim: "Every score carries a written reason",
    mechanism:
      "A judge cannot submit a criterion score without a justification for it. There is no path that records a bare number.",
    enforcement: "The justification column is NOT NULL.",
  },
  {
    claim: "The credential outlives the platform session",
    mechanism:
      "A packet is a public URL that opens without an account, for you or for anyone the candidate sends it to.",
    enforcement: "No login wall, and no expiry on the link.",
  },
];

export interface Limit {
  question: string;
  answer: string;
}

/**
 * The honest-limits section.
 *
 * No competitor publishes one, which is precisely why it is worth publishing: a
 * hiring team that has been sold a screening tool before knows the claims are
 * always overstated, and the fastest way past that is to say the boundary out
 * loud first. It also pre-empts the objections a sales call would otherwise
 * spend its time on.
 *
 * Written as questions because that is how a recruiter actually holds them, and
 * because it lets the page carry FAQPage structured data honestly.
 */
export const LIMITS: Limit[] = [
  {
    question: "Does a proof packet tell you whether someone is good to work with?",
    answer:
      "No. It shows what they built under a clock and what judges thought of it. Collaboration, communication and how someone handles being wrong are things you still have to find out by talking to them.",
  },
  {
    question: "Does a strong score in one domain predict another?",
    answer:
      "No, and it is built not to. Ratings are held per domain, so backend work never inflates a frontend number. A packet is evidence about one kind of problem.",
  },
  {
    question: "Does this measure long-horizon engineering judgement?",
    answer:
      "Not really. Arenas are time-boxed, so they reward decisions made under pressure. Whether someone maintains a system well over two years is not something a sprint can show.",
  },
  {
    question: "Does it replace a technical interview?",
    answer:
      "It replaces the part that establishes whether someone can build at all - the screen, the take-home, the first call. The interview that remains is about how they think and whether they fit your codebase, which is the conversation worth having.",
  },
  {
    question: "What about a developer who has never entered an arena?",
    answer:
      "There is nothing to read, and that is not evidence against them. This gives you a way to trust the candidates who do have a packet; it says nothing about the ones who do not.",
  },
];
