"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { type ArenaFormInput, RULES_MAX } from "@/lib/arena/schema";
import { CharCount, FieldLabel, LineTextarea } from "../fields";

const DELIVERABLES = [
  {
    field: "requireGithubUrl" as const,
    label: "A repo",
    detail: "Where the code lives",
  },
  {
    field: "requireVideoUrl" as const,
    label: "A demo",
    detail: "PRD 1.3: the demo is the point",
  },
  {
    field: "requireWriteup" as const,
    label: "A write-up",
    detail: "What they built and why",
  },
  {
    field: "requireFigmaUrl" as const,
    label: "A design file",
    detail: "Only if the brief needs one",
  },
] as const;

/**
 * What a team has to hand in, and anything else they should know.
 *
 * Four checkboxes rather than a segmented control, because these are not
 * alternatives - a host can require all four. Each is a square that fills
 * rather than a native checkbox so it matches the rest of the page, with the
 * real input kept underneath for keyboard and screen-reader behaviour.
 */
export function HandInStep({
  register,
  errors,
  watch,
  setValue,
}: {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  watch: UseFormWatch<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="contents">
          <FieldLabel as="span" hint="Checked items are required to submit">
            What they hand in
          </FieldLabel>
        </legend>

        <ul className="grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2">
          {DELIVERABLES.map(({ field, label, detail }) => {
            const checked = Boolean(watch(field));
            const id = `deliverable-${field}`;

            return (
              <li key={field} className="bg-background">
                <label
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors hover:bg-foreground/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-orange"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setValue(field, e.target.checked, { shouldValidate: true })}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                      checked ? "border-orange bg-orange" : "border-foreground/35 bg-transparent"
                    }`}
                  >
                    {checked && (
                      <span className="font-mono text-[0.6rem] font-bold leading-none text-[#0E0E0D]">
                        ×
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-foreground">
                      {label}
                    </span>
                    <span className="font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <FieldLabel htmlFor="arena-rules" error={errors.rulesText?.message}>
            Anything else
          </FieldLabel>
          <CharCount value={watch("rulesText") ?? ""} max={RULES_MAX} />
        </div>
        <LineTextarea
          id="arena-rules"
          rows={6}
          maxLength={RULES_MAX}
          placeholder="No pre-built starters. Any stack. Be nice in the chat."
          invalid={Boolean(errors.rulesText)}
          className="max-w-[72ch]"
          {...register("rulesText")}
        />
      </div>
    </div>
  );
}

export default HandInStep;
