"use client";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { ARENA_DOMAINS, ARENA_DIFFICULTIES } from "@/lib/arena/taxonomy";
import { SegmentedChoice, FieldLabel } from "../fields";
import { TagPicker } from "../TagPicker";

/**
 * Domain and difficulty, asked for the first time.
 *
 * Both columns have existed since the schema was written and neither was ever
 * on the form, so every arena took the default: 106 of 106 are
 * FULL_STACK_WEB and INTERMEDIATE. That is not a cosmetic gap - `domain` is
 * the bucket a rating is earned in (PRD 3.3) and `difficulty` carries the XP
 * multiplier (PRD 8.1), so a board where both are constant cannot support a
 * per-domain leaderboard or a meaningful rating.
 *
 * Domain renders as a 3x3 grid rather than a dropdown: there are exactly nine,
 * they are the shape of the board, and a select would hide eight of them
 * behind a click.
 */
export function KindStep({
  watch,
  setValue,
}: {
  watch: UseFormWatch<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
}) {
  const domain = watch("domain") ?? "FULL_STACK_WEB";
  const difficulty = watch("difficulty") ?? "INTERMEDIATE";

  return (
    <div className="flex flex-col gap-10">
      <SegmentedChoice
        label="Domain"
        hint="Which ladder it counts towards"
        name="arena-domain"
        columns={3}
        value={domain}
        onChange={(next) => setValue("domain", next, { shouldValidate: true })}
        options={ARENA_DOMAINS}
      />

      <SegmentedChoice
        label="Difficulty"
        hint="Sets how much a result is worth"
        name="arena-difficulty"
        columns={2}
        value={difficulty}
        onChange={(next) => setValue("difficulty", next, { shouldValidate: true })}
        options={ARENA_DIFFICULTIES}
      />

      <div className="flex flex-col gap-3">
        <FieldLabel as="span" hint="Optional — how it feels, not what it uses">
          Tags
        </FieldLabel>
        <TagPicker watch={watch} setValue={setValue} />
      </div>
    </div>
  );
}

export default KindStep;
