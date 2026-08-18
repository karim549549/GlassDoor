"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { BinaryChoice, Field, LineInput, SegmentedChoice } from "../fields";

/**
 * Team shape and who is allowed in.
 *
 * Access moved here from third place in the old order. "Is this private" is
 * paperwork, and asking it two steps in interrupted a host who was still
 * deciding what the challenge was.
 */
export function WhoStep({
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
  const isTeam = Boolean(watch("isTeam"));
  const isPrivate = Boolean(watch("isPrivate"));

  return (
    <div className="flex flex-col gap-10">
      <SegmentedChoice
        label="Entering"
        name="entry-mode"
        value={isTeam ? "team" : "solo"}
        onChange={(next) => {
          const team = next === "team";
          setValue("isTeam", team, { shouldValidate: true });
          // Keep the sizes coherent with the mode rather than leaving a solo
          // arena carrying a max of four, which the board would then render as
          // "teams of 1-4" on something nobody can bring a team to.
          setValue("minTeamSize", team ? 2 : 1, { shouldValidate: true });
          setValue("maxTeamSize", team ? 4 : 1, { shouldValidate: true });
        }}
        options={[
          { value: "solo", label: "Solo", detail: "One person, one entry" },
          { value: "team", label: "Teams", detail: "The reference format" },
        ]}
      />

      {isTeam && (
        <div className="grid gap-6 border-l-2 border-orange/40 pl-5 sm:grid-cols-2">
          <Field label="Smallest team" htmlFor="min-team" error={errors.minTeamSize?.message}>
            <LineInput
              id="min-team"
              type="number"
              min={1}
              max={10}
              invalid={Boolean(errors.minTeamSize)}
              {...register("minTeamSize")}
            />
          </Field>
          <Field label="Largest team" htmlFor="max-team" error={errors.maxTeamSize?.message}>
            <LineInput
              id="max-team"
              type="number"
              min={1}
              max={10}
              invalid={Boolean(errors.maxTeamSize)}
              {...register("maxTeamSize")}
            />
          </Field>
        </div>
      )}

      <Field
        label="Cap on entrants"
        hint="Leave empty for no limit"
        htmlFor="max-participants"
        error={errors.maxParticipants?.message}
      >
        <LineInput
          id="max-participants"
          type="number"
          min={1}
          placeholder="No limit"
          invalid={Boolean(errors.maxParticipants)}
          {...register("maxParticipants")}
        />
      </Field>

      <BinaryChoice
        label="Who can enter"
        name="visibility"
        value={isPrivate}
        onChange={(next) => {
          setValue("isPrivate", next, { shouldValidate: true });
          if (!next) setValue("inviteCode", null);
        }}
        offLabel="Anyone"
        offDetail="Listed on the board"
        onLabel="Invite only"
        onDetail="Needs a code"
      />

      {isPrivate && (
        <div className="border-l-2 border-orange/40 pl-5">
          <Field
            label="Invite code"
            hint="Share it with the people you want"
            htmlFor="invite-code"
            error={errors.inviteCode?.message}
          >
            <LineInput
              id="invite-code"
              type="text"
              autoComplete="off"
              placeholder="SATURDAY-CREW"
              invalid={Boolean(errors.inviteCode)}
              {...register("inviteCode")}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default WhoStep;
