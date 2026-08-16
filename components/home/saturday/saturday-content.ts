/**
 * Copy for section 5 - what actually happens if you enter one.
 *
 * Replaces the employer pitch that used to sit here ("Delete three rounds", a
 * hiring pipeline with stages struck out). That argument is not wrong, it is
 * just aimed at the wrong audience: it now lives on /companies, where the
 * people it addresses actually go. See PRD 1.2.
 *
 * The page had started saying "pick a brief" without ever showing what a brief
 * turns into. This answers the question a newcomer actually holds - what am I
 * signing up for - hour by hour, and it is the section that has to feel true
 * rather than impressive.
 */

export interface Moment {
  /** Elapsed time from the brief dropping. */
  time: string;
  label: string;
  /** Short mono subline under the label. */
  detail: string;
  /** The longer note in the right-hand column. */
  note: string;
  /** The payoff row, given the accent treatment. */
  emphasis?: boolean;
}

export const TIMELINE: Moment[] = [
  {
    time: "00:00",
    label: "The brief drops",
    detail: "Nobody has seen it before now",
    note: "Everyone opens it at the same moment. There is no prep, no head start, and no way to have quietly built most of it last week.",
  },
  {
    time: "00:30",
    label: "Pens down",
    detail: "Planning window closes",
    note: "Whatever you sketched is what you are building. Thirty minutes is deliberately not long enough to talk yourself out of the interesting idea.",
  },
  {
    time: "02:00",
    label: "Something breaks",
    detail: "It always does",
    note: "This is the part nobody puts on a landing page. You will throw away a decision you made at 00:20, and you will be fine.",
  },
  {
    time: "04:30",
    label: "The clock dies",
    detail: "Whatever you have is what ships",
    note: "No extensions. A half-built thing that does one bit brilliantly beats a finished thing that does nothing surprising.",
  },
  {
    time: "04:45",
    label: "You demo it",
    detail: "Five minutes, screen shared",
    note: "Show it working, or show it failing and say what you meant. Both are fine. This is the part people actually turn up for.",
  },
  {
    time: "05:15",
    label: "The verdict",
    detail: "A person, not a test suite",
    note: "A working engineer says what they thought and why, in writing, with their name on it. You are allowed to disagree with them out loud.",
    emphasis: true,
  },
];

export interface Reassurance {
  heading: string;
  body: string;
}

/**
 * The barrier to entering something like this is not interest, it is the fear
 * of being visibly bad at it in front of strangers. These three exist to
 * dismantle exactly that, and each has to be true - a reassurance that turns
 * out to be false on the day is worse than none.
 */
export const REASSURANCES: Reassurance[] = [
  {
    heading: "You do not need to be good yet",
    body: "Most entries are unfinished, and the finished ones are rarely the interesting ones. Everyone is building something they have not built before, under a clock, badly. That is the format working, not failing.",
  },
  {
    heading: "Come on your own",
    body: "You do not need to arrive with a team. Turn up alone and we will put you with people, and plenty of entries are solo anyway. Meeting the others is most of the point.",
  },
  {
    heading: "Losing costs you nothing",
    body: "No fee, no penalty, no downside to entering something you are not sure about. Worst case, you spent a Saturday building something strange and met a few people doing the same.",
  },
];
