"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { FieldLabel, LineTextarea } from "../fields";

/**
 * The one step that is not a form.
 *
 * The title is set in the display face at hero size with nothing around it but
 * a hairline, so typing the brief looks like the headline it becomes. The old
 * page put a normal text input here and then rendered a shrunken preview card
 * beside it to show what the title would look like - two things doing one job,
 * and the preview was of a card design that no longer exists.
 *
 * PRD 1.3: the reference format's briefs are jokes - "the most devious video
 * player", "a site with zero business value". The placeholder says so, because
 * the single biggest influence on what a host writes is the example in front
 * of them.
 */
export function BriefStep({
  register,
  errors,
}: {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <FieldLabel htmlFor="arena-title" error={errors.title?.message}>
          The brief
        </FieldLabel>
        <input
          id="arena-title"
          type="text"
          autoComplete="off"
          placeholder="The most devious video player"
          aria-invalid={errors.title ? true : undefined}
          className={[
            // Filled like every other input, so it is obviously a place to
            // type - but set in the display face, so what you type already
            // looks like the headline it becomes on the board.
            "w-full border bg-secondary px-4 py-3",
            "font-display text-[clamp(1.5rem,4vw,2.5rem)] italic leading-[1.15] text-foreground",
            "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-orange/30 transition-colors",
            errors.title ? "border-accent" : "border-foreground/15 focus:border-orange",
          ].join(" ")}
          {...register("title")}
        />
        <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          Short, specific, a little absurd. This is the whole pitch.
        </p>
      </div>

      <div className="flex max-w-[68ch] flex-col gap-2">
        <FieldLabel htmlFor="arena-description" error={errors.description?.message}>
          What are they actually building?
        </FieldLabel>
        <LineTextarea
          id="arena-description"
          rows={6}
          placeholder="Make watching something a genuinely hostile experience. It has to play video. Everything else is up to you."
          invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          Constraints are more fun than requirements
        </p>
      </div>
    </div>
  );
}

export default BriefStep;
