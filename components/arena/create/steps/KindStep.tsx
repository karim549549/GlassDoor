"use client";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { ARENA_DIFFICULTIES } from "@/lib/arena/taxonomy";
import { SegmentedChoice } from "../fields";

/**
 * How hard it is, and nothing else.
 *
 * This step briefly asked for a domain and a set of tags as well. Both are
 * gone: classifying a playful build challenge by engineering discipline was
 * the hiring taxonomy in disguise, and it pushed hosts toward
 * discipline-shaped briefs, which are the boring ones - "the worst landing
 * page" is not frontend, and the interesting half is "worst". The tag list
 * that would have replaced it (make-it-bad, hostile, one-tool-only) is the
 * right axis at the wrong time: with no entries yet, any taxonomy is a guess,
 * and none is more honest than a wrong one.
 *
 * Difficulty stays because it answers a real question a reader has - can a
 * beginner attempt this - and PRD 8.1 hangs the XP multiplier on it.
 */
export function KindStep({
  watch,
  setValue,
}: {
  watch: UseFormWatch<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
}) {
  const difficulty = watch("difficulty") ?? "INTERMEDIATE";

  return (
    <SegmentedChoice
      label="Difficulty"
      hint="Who should feel welcome to try"
      name="arena-difficulty"
      columns={2}
      value={difficulty}
      onChange={(next) => setValue("difficulty", next, { shouldValidate: true })}
      options={ARENA_DIFFICULTIES}
    />
  );
}

export default KindStep;
