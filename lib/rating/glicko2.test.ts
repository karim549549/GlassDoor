import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GLICKO2_DEFAULTS,
  GLICKO2_SCALE,
  MAX_DEVIATION,
  ratePeriod,
  type Glicko2Rating,
} from "./glicko2";

const PLAYER: Glicko2Rating = { rating: 1500, deviation: 200, volatility: 0.06 };

test("reproduces Glickman's worked example from the Glicko-2 paper", () => {
  const updated = ratePeriod(
    PLAYER,
    [
      { opponent: { rating: 1400, deviation: 30, volatility: 0.06 }, score: 1 },
      { opponent: { rating: 1550, deviation: 100, volatility: 0.06 }, score: 0 },
      { opponent: { rating: 1700, deviation: 300, volatility: 0.06 }, score: 0 },
    ],
    0.5,
  );

  // Glickman rounds intermediate values to 4dp throughout the worked example, so the
  // published figures (1464.06 / 151.52 / 0.05999) carry accumulated rounding. A
  // full-precision implementation lands at 1464.0507 / 151.5165 / 0.0599960. These are
  // the same result; asserting the paper's digits exactly would be asserting Glickman's
  // rounding, not the algorithm. Tolerances are tight enough that a genuine error
  // (a dropped g(phi), a wrong sign, a skipped volatility solve) still fails loudly.
  assert.ok(Math.abs(updated.rating - 1464.06) < 0.02, `rating ${updated.rating}`);
  assert.ok(Math.abs(updated.deviation - 151.52) < 0.02, `deviation ${updated.deviation}`);
  assert.ok(Math.abs(updated.volatility - 0.05999) < 1e-5, `volatility ${updated.volatility}`);
});


test("exports the documented defaults and scale factor", () => {
  assert.equal(GLICKO2_DEFAULTS.rating, 1500);
  assert.equal(GLICKO2_DEFAULTS.deviation, 350);
  assert.equal(GLICKO2_DEFAULTS.volatility, 0.06);
  assert.equal(GLICKO2_DEFAULTS.tau, 0.5);
  assert.equal(GLICKO2_SCALE, 173.7178);
});

test("an idle period leaves rating and volatility alone but widens deviation", () => {
  const updated = ratePeriod(PLAYER, []);

  assert.equal(updated.rating, PLAYER.rating);
  assert.equal(updated.volatility, PLAYER.volatility);
  assert.ok(
    updated.deviation > PLAYER.deviation,
    `expected deviation to grow from ${PLAYER.deviation}, got ${updated.deviation}`,
  );

  // phi' = sqrt(phi^2 + sigma^2), expressed back on the display scale.
  const phi = PLAYER.deviation / GLICKO2_SCALE;
  const expected =
    Math.sqrt(phi * phi + PLAYER.volatility * PLAYER.volatility) * GLICKO2_SCALE;
  assert.ok(Math.abs(updated.deviation - expected) < 1e-9);
});

test("deviation shrinks after a period that produced results", () => {
  const updated = ratePeriod(PLAYER, [
    { opponent: { rating: 1500, deviation: 100, volatility: 0.06 }, score: 1 },
    { opponent: { rating: 1500, deviation: 100, volatility: 0.06 }, score: 0 },
    { opponent: { rating: 1500, deviation: 100, volatility: 0.06 }, score: 1 },
  ]);

  assert.ok(
    updated.deviation < PLAYER.deviation,
    `expected deviation below ${PLAYER.deviation}, got ${updated.deviation}`,
  );
});

test("anti-farming: beating an uncertain opponent moves the rating much less", () => {
  const sameRating = 1500;

  const vsKnown = ratePeriod(PLAYER, [
    { opponent: { rating: sameRating, deviation: 30, volatility: 0.06 }, score: 1 },
  ]);
  const vsProvisional = ratePeriod(PLAYER, [
    { opponent: { rating: sameRating, deviation: 350, volatility: 0.06 }, score: 1 },
  ]);

  const knownGain = vsKnown.rating - PLAYER.rating;
  const provisionalGain = vsProvisional.rating - PLAYER.rating;

  assert.ok(knownGain > 0 && provisionalGain > 0, "both wins should raise the rating");
  assert.ok(
    provisionalGain < knownGain,
    `expected ${provisionalGain} < ${knownGain}`,
  );
  assert.ok(
    provisionalGain < knownGain * 0.85,
    `farming a high-RD opponent should be substantially less rewarding: ` +
      `${provisionalGain} vs ${knownGain}`,
  );
});

test("a win and a loss against the same opponent are mirror images", () => {
  const opponent: Glicko2Rating = { rating: 1500, deviation: 80, volatility: 0.06 };

  const afterWin = ratePeriod(PLAYER, [{ opponent, score: 1 }]);
  const afterLoss = ratePeriod(PLAYER, [{ opponent, score: 0 }]);

  const gain = afterWin.rating - PLAYER.rating;
  const drop = PLAYER.rating - afterLoss.rating;

  assert.ok(gain > 0, `expected a gain, got ${gain}`);
  assert.ok(drop > 0, `expected a drop, got ${drop}`);
  assert.ok(
    Math.abs(gain - drop) < 1e-6,
    `magnitudes should match: gain ${gain}, drop ${drop}`,
  );
});

test("idle periods grow the deviation monotonically without exceeding the cap", () => {
  let current: Glicko2Rating = { rating: 1500, deviation: 200, volatility: 0.06 };
  let previous = current.deviation;

  for (let i = 0; i < 500; i += 1) {
    current = ratePeriod(current, []);
    assert.ok(current.deviation >= previous, "deviation must never shrink while idle");
    assert.ok(current.deviation <= MAX_DEVIATION, "deviation must never exceed the cap");
    previous = current.deviation;
  }

  // At the default volatility the growth is genuinely slow — 500 idle periods only
  // reaches ~307 from a starting 200. Asserting it *reaches* 350 would be asserting a
  // rate of decay nobody specified; the invariants above are the real contract.
  assert.ok(current.deviation > 300, `expected meaningful growth, got ${current.deviation}`);
  assert.equal(current.rating, 1500);
});

test("the deviation cap actually binds when volatility is extreme", () => {
  // Reaches the clamp in a single period, which the slow-growth case above never does.
  const volatile: Glicko2Rating = { rating: 1500, deviation: 349, volatility: 0.9 };
  assert.equal(ratePeriod(volatile, []).deviation, MAX_DEVIATION);
});

test("the volatility solver terminates for extreme upsets", () => {
  // A heavy favourite losing every game is the pathological case for the root-find.
  const favourite: Glicko2Rating = { rating: 2200, deviation: 60, volatility: 0.06 };
  const updated = ratePeriod(
    favourite,
    Array.from({ length: 10 }, () => ({
      opponent: { rating: 1200, deviation: 40, volatility: 0.06 },
      score: 0,
    })),
  );

  assert.ok(Number.isFinite(updated.rating));
  assert.ok(Number.isFinite(updated.deviation));
  assert.ok(Number.isFinite(updated.volatility));
  assert.ok(updated.volatility > favourite.volatility, "erratic results raise sigma");
  assert.ok(updated.rating < favourite.rating);
});

test("a batched period differs from replaying the same results one at a time", () => {
  const results = [
    { opponent: { rating: 1400, deviation: 30, volatility: 0.06 }, score: 1 },
    { opponent: { rating: 1550, deviation: 100, volatility: 0.06 }, score: 0 },
    { opponent: { rating: 1700, deviation: 300, volatility: 0.06 }, score: 0 },
  ];

  const batched = ratePeriod(PLAYER, results);

  let sequential: Glicko2Rating = PLAYER;
  for (const result of results) {
    sequential = ratePeriod(sequential, [result]);
  }

  // Batching is not decomposable into per-match updates — that is the whole reason
  // ratePeriod takes an array. Measured direction: per-match replay applies step 6's
  // volatility inflation once per match instead of once per period, so it ends up with
  // a HIGHER deviation (more uncertainty), and the gap widens with more results.
  assert.ok(
    sequential.deviation > batched.deviation,
    `per-match RD ${sequential.deviation} should exceed batched ${batched.deviation}`,
  );
  assert.notEqual(sequential.rating.toFixed(4), batched.rating.toFixed(4));
});

test("per-match replay is order-dependent, which is why periods are batched", () => {
  const results = [
    { opponent: { rating: 1400, deviation: 30, volatility: 0.06 }, score: 1 },
    { opponent: { rating: 1550, deviation: 100, volatility: 0.06 }, score: 0 },
    { opponent: { rating: 1700, deviation: 300, volatility: 0.06 }, score: 0 },
  ];

  const replay = (order: typeof results) =>
    order.reduce<Glicko2Rating>((acc, r) => ratePeriod(acc, [r]), PLAYER);

  const forward = replay(results);
  const reversed = replay([...results].reverse());

  // Same results, different order, different rating — a real defect.
  assert.notEqual(forward.rating.toFixed(4), reversed.rating.toFixed(4));

  // Batching is order-invariant, which is the property that makes a rating meaningful.
  const batchedForward = ratePeriod(PLAYER, results);
  const batchedReversed = ratePeriod(PLAYER, [...results].reverse());
  assert.equal(batchedForward.rating.toFixed(10), batchedReversed.rating.toFixed(10));
  assert.equal(batchedForward.deviation.toFixed(10), batchedReversed.deviation.toFixed(10));
});
