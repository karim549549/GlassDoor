/**
 * Copy for section 5, the hiring pitch.
 *
 * The argument is made by deletion: a hiring pipeline with three stages struck
 * out and a note on who removed them. That is checkable and true on day one,
 * which a percentage nobody has measured yet would not be.
 *
 * Kept out of the component per AGENTS.md - this is the part that gets edited
 * when the pitch changes, and it should not sit in a file whose other concern
 * is a scroll-driven colour morph.
 */

export interface Stage {
  label: string;
  detail: string;
  /** Struck through: this stage stops existing. */
  cut?: boolean;
  /** The replacement, shown where a cut stage used to be. */
  replacedBy?: string;
}

export const PIPELINE: Stage[] = [
  { label: "Post the role", detail: "Same as today" },
  {
    label: "Sift 200 CVs",
    detail: "Self-reported, unverifiable, mostly noise",
    cut: true,
    replacedBy: "Open the board. Every entrant already has judged work attached.",
  },
  {
    label: "Screening call",
    detail: "Half an hour to establish they can code at all",
    cut: true,
    replacedBy: "Read the commits and the defense. That question is answered.",
  },
  {
    label: "Take-home exercise",
    detail: "Unpaid, unsupervised, and nobody knows who wrote it",
    cut: true,
    replacedBy: "The arena was the exercise - timed, watched, and judged in public.",
  },
  { label: "Technical interview", detail: "Now about how they think, not whether they can" },
  { label: "Offer", detail: "Made on evidence rather than on impression" },
];

export const VALUE = [
  {
    heading: "You see the work, not a summary of it",
    body: "Every candidate arrives with a proof packet: the brief they were given, the commits they made under the clock, and each judge's score with written reasoning.",
  },
  {
    heading: "The rubric was frozen before anyone started",
    body: "So the scoring cannot be shaped around a favoured result. Judges are named, and cannot score their own team - that is a database constraint, not a policy promise.",
  },
  {
    heading: "Or set the problem yourself",
    body: "Host an arena around work you actually need done. You choose the brief, the clock and the deliverables, and you can change the requirements partway through to see who adapts.",
  },
];
