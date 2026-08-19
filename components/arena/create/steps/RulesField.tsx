"use client";

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { type ArenaFormInput, RULE_MAX, RULES_MAX_COUNT } from "@/lib/arena/schema";
import { FieldLabel, LineInput } from "../fields";

/**
 * House rules, collected one at a time.
 *
 * This was a six-row textarea, and every host used it the way the seed data
 * did: "Original work only. Any stack. Be nice in the chat." - three rules in
 * one paragraph, because a textarea invites a paragraph. The arena page then
 * had no way to render them as anything but a paragraph, so three separate
 * rules arrived as prose nobody scans.
 *
 * Collecting them as rows removes the guesswork at both ends. The host writes
 * one rule per line because the field only has one line, and the page renders
 * a list because it was given a list.
 *
 * The cost is honest: pasting an existing block of rules now means splitting
 * it by hand. That is a worse thirty seconds once, for a better page every
 * time it is read.
 */
export function RulesField({
  control,
  register,
  error,
}: {
  control: Control<ArenaFormInput>;
  register: UseFormRegister<ArenaFormInput>;
  /** Array-level message: too many rules. Per-row errors sit on the row. */
  error?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    // `rules` is `string[]`, and useFieldArray wants objects - the cast is the
    // standard escape hatch for a primitive array. Values still register as
    // `rules.0`, `rules.1`, which is the shape zod parses.
    name: "rules" as never,
  });

  const atLimit = fields.length >= RULES_MAX_COUNT;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <FieldLabel htmlFor="arena-rule-0" error={error}>
          House rules
        </FieldLabel>
        <span className="font-mono text-[0.55rem] uppercase tracking-wider tabular-nums text-muted-foreground">
          {fields.length} of {RULES_MAX_COUNT}
        </span>
      </div>

      <p className="max-w-[72ch] font-sans text-[0.8rem] leading-relaxed text-muted-foreground">
        One per line. Entrants read these as a checklist, so keep each one to a
        single thing they can obey.
      </p>

      {fields.length > 0 && (
        <ul className="flex max-w-[72ch] flex-col gap-2">
          {fields.map((field, index) => (
            <li key={field.id} className="flex items-center gap-2">
              <span
                aria-hidden
                className="w-4 shrink-0 text-center font-mono text-[0.7rem] font-bold text-orange-ink"
              >
                —
              </span>

              <LineInput
                id={`arena-rule-${index}`}
                aria-label={`Rule ${index + 1}`}
                maxLength={RULE_MAX}
                placeholder="Original work only."
                className="min-w-0 flex-1"
                {...register(`rules.${index}` as const)}
              />

              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove rule ${index + 1}`}
                className="shrink-0 cursor-pointer border border-transparent p-1.5 text-foreground/45 transition-colors hover:border-foreground/20 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={atLimit}
        onClick={() => append("" as never)}
        className="mt-1 flex cursor-pointer items-center gap-1.5 self-start border border-foreground/25 bg-background px-3 py-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        <Plus aria-hidden className="h-3 w-3" />
        {fields.length === 0 ? "Add a rule" : "Add another"}
      </button>

      {atLimit && (
        <p className="font-sans text-[0.78rem] text-muted-foreground">
          {RULES_MAX_COUNT} is the cap. Past that it stops being house rules and
          becomes terms and conditions.
        </p>
      )}
    </div>
  );
}

export default RulesField;
