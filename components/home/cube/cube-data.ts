/**
 * Geometry, tuning constants and copy for the section 4 cube.
 *
 * Split out of ThreeSidedPerspective.tsx, which was 492 lines carrying four
 * unrelated concerns at once: this data, the drag physics, the render loop and
 * the layout. AGENTS.md keeps static data and option lists out of components
 * for exactly this reason - the copy below is edited far more often than the
 * rAF loop, and the two should not share a file that has to be re-read in full
 * to change one word.
 *
 * Nothing here touches the DOM, so it is all trivially readable and testable on
 * its own.
 */

/** Cube edge in px. Faces are square, so this is both width and height. */
export const SIZE = 420;
export const HALF = SIZE / 2;

/** Per face: the rotation that places it, and the outward normal that produces. */
export const FACE_GEOMETRY = [
  { rx: 0, ry: 0, normal: [0, 0, 1] as [number, number, number] },
  { rx: 0, ry: 90, normal: [1, 0, 0] as [number, number, number] },
  { rx: 0, ry: 180, normal: [0, 0, -1] as [number, number, number] },
  { rx: 0, ry: -90, normal: [-1, 0, 0] as [number, number, number] },
  // CSS Y grows downward, so rotateX(90deg) sends +Z to -Y.
  { rx: 90, ry: 0, normal: [0, -1, 0] as [number, number, number] },
  { rx: -90, ry: 0, normal: [0, 1, 0] as [number, number, number] },
];

/** Distance above the stage the assembly starts, in px. */
export const ARRIVE_FROM = 1250;
/** Fraction of the section over which it descends into place. */
export const ARRIVE_BY = 0.5;

/**
 * Flywheel constants. Drag is the only input: scroll used to spin it too, but
 * two sources fighting for one rotation meant the cube moved while you were
 * only reading, and a face could never be parked.
 */
export const DRAG_IMPULSE = 0.13;
export const FRICTION = 0.94;
export const IDLE_DRIFT = 0.018;

/**
 * What a developer walks away with.
 *
 * The page already spends three sections showing arena cards; a fourth was the
 * same pitch a third time. These six faces answer the question those sections
 * leave open - why enter one at all - in the reader's terms rather than ours.
 * Nothing here describes how the platform is built.
 */
export interface Reward {
  tag: string;
  title: string;
  body: string;
  statLabel: string;
  stat: string;
  notes: string[];
}

export const REWARDS: Reward[] = [
  {
    tag: "Prize money",
    title: "Win the pool, not a badge",
    body: "Arenas carry real prize money put up by whoever hosts them. Top three place, paid in EGP, with the split shown on the arena before you enter.",
    statLabel: "Paid by", stat: "The host",
    notes: ["1ST", "2ND", "3RD"],
  },
  {
    tag: "Rating",
    title: "A number you did not write yourself",
    body: "Every judged result moves a Glicko-2 rating in that one domain. Backend work never inflates a frontend score, and nobody can edit it, including us.",
    statLabel: "Domains", stat: "9, rated apart",
    notes: ["EARNED", "PER DOMAIN", "PERMANENT"],
  },
  {
    tag: "Credential",
    title: "One link that survives the interview",
    body: "You leave with a proof packet: the brief, your commits, every judge's score and reasoning. Public, permanent, and readable without an account.",
    statLabel: "Costs", stat: "Nothing",
    notes: ["PUBLIC", "PERMANENT", "YOURS"],
  },
  {
    tag: "Standing",
    title: "A place on the board",
    body: "Every arena publishes its leaderboard, and your rating stacks across all of them. Being good becomes something a stranger can look up.",
    statLabel: "Visible to", stat: "Anyone",
    notes: ["RANKED", "PER ARENA", "CUMULATIVE"],
  },
  {
    tag: "People",
    title: "A team, and the judges who read your work",
    body: "Team arenas put you with people who build at your level under real pressure. The judges are working engineers who then read your code closely.",
    statLabel: "Teams of", stat: "2 to 4",
    notes: ["SQUAD", "PEERS", "JUDGES"],
  },
  {
    tag: "Pipeline",
    title: "Companies read the board",
    body: "Hiring teams shortlist from judged work instead of CVs. A strong packet is a direct route to a conversation, and you decide who may contact you.",
    statLabel: "Contact", stat: "Your call",
    notes: ["SHORTLIST", "NO SCREEN", "CONSENT"],
  },
];

export interface Callout {
  face: number;
  label: string;
  value: string;
  side: "left" | "right";
  top: string;
  inset: string;
  line: number;
}

/**
 * Exploded-view annotations. A square cube cannot fill a 16:9 viewport without
 * overflowing its height, so the width is carried by radiating callouts rather
 * than by widening the solid or parking a text column beside it.
 *
 * `top`, `inset` and `line` are deliberately irregular - a regular grid of these
 * would be the wireframe this layout exists to avoid.
 */
export const CALLOUTS: Callout[] = [
  { face: 0, label: "01 Register", value: "Take a seat before the deadline", side: "left", top: "30%", inset: "3%", line: 190 },
  { face: 3, label: "02 Plan", value: "Approach recorded before any code", side: "left", top: "52%", inset: "1%", line: 245 },
  { face: 5, label: "03 Build", value: "Commits sync while the clock runs", side: "left", top: "74%", inset: "5%", line: 164 },
  { face: 2, label: "04 Judge", value: "Named judges, written reasoning", side: "right", top: "26%", inset: "4%", line: 178 },
  { face: 1, label: "05 Results", value: "Leaderboard, rating, prize", side: "right", top: "50%", inset: "1%", line: 238 },
  { face: 4, label: "Then", value: "The packet is yours to keep", side: "right", top: "76%", inset: "6%", line: 156 },
];

/** Applies rotateX(rx) rotateY(ry) to a vector, matching the CSS order. */
export function rotateVec(
  v: [number, number, number],
  rx: number,
  ry: number
): [number, number, number] {
  const rad = Math.PI / 180;
  const cy = Math.cos(ry * rad);
  const sy = Math.sin(ry * rad);
  const x1 = v[0] * cy + v[2] * sy;
  const y1 = v[1];
  const z1 = -v[0] * sy + v[2] * cy;
  const cx = Math.cos(rx * rad);
  const sx = Math.sin(rx * rad);
  return [x1, y1 * cx - z1 * sx, y1 * sx + z1 * cx];
}
