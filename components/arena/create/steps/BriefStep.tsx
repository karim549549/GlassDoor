"use client";

import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import {
  type ArenaFormInput,
  TITLE_MAX,
  DESCRIPTION_MAX,
} from "@/lib/arena/schema";
import { CharCount, FieldLabel, LineTextarea } from "../fields";

/**
 * The one step that is not really a form.
 *
 * The title is set in the display face at close to the size the board renders
 * it, so what a host types already looks like the headline it becomes. The old
 * page put a plain input here and a shrunken preview card beside it to show
 * the same thing - two elements doing one job, and the preview was of a card
 * design that no longer exists.
 *
 * PRD 1.3: the reference format's briefs are jokes - "the most devious video
 * player", "a site with zero business value". The placeholders say so, because
 * the strongest influence on what a host writes is the example in front of
 * them.
 */
export function BriefStep({
  register,
  errors,
  watch,
}: {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  watch: UseFormWatch<ArenaFormInput>;
}) {
  const title = watch("title") ?? "";
  const description = watch("description") ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {/* "Title", not "The brief". The brief is the paragraph below, and
              that is what the arena page calls it - two fields sharing one
              name was enough to make a reader ask which one had been dropped. */}
          <FieldLabel htmlFor="arena-title" error={errors.title?.message}>
            Title
          </FieldLabel>
          <CharCount value={title} max={TITLE_MAX} min={3} />
        </div>

        <input
          id="arena-title"
          type="text"
          autoComplete="off"
          maxLength={TITLE_MAX}
          placeholder="The most devious video player"
          aria-invalid={errors.title ? true : undefined}
          className={[
            // Filled like every other input, so it is obviously a place to
            // type - but set in the display face, so it reads as the headline.
            "w-full border bg-secondary px-4 py-3",
            "font-display text-[clamp(1.5rem,3.4vw,2.35rem)] italic leading-[1.15] text-foreground",
            "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-orange/30 transition-colors",
            errors.title ? "border-accent" : "border-foreground/15 focus:border-orange",
          ].join(" ")}
          {...register("title")}
        />
        <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          Short, specific, a little absurd. This is the headline on the board.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <FieldLabel htmlFor="arena-description" error={errors.description?.message}>
            The brief
          </FieldLabel>
          <CharCount value={description} max={DESCRIPTION_MAX} min={10} />
        </div>

        <LineTextarea
          id="arena-description"
          rows={8}
          maxLength={DESCRIPTION_MAX}
          placeholder="Make watching something a genuinely hostile experience. It has to play video. Everything else is up to you."
          invalid={Boolean(errors.description)}
          className="max-w-[72ch]"
          {...register("description")}
        />
        <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          What are they actually building? Constraints are more fun than requirements
        </p>
      </div>
    </div>
  );
}

export default BriefStep;
