"use client";

import { useState } from "react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";
import {
  SCHEDULE_PRESETS,
  deriveSchedule,
  findPreset,
  type SchedulePresetId,
} from "@/lib/arena/schedule-presets";
import { Field, FieldLabel, LineInput, SegmentedChoice } from "../fields";
import { ClockRibbon } from "../ClockRibbon";

const PRESET_OPTIONS = [
  ...SCHEDULE_PRESETS.map((p) => ({ value: p.id as SchedulePresetId, label: p.label, detail: p.tagline })),
  { value: "custom" as SchedulePresetId, label: "Custom", detail: "Set all six windows" },
];

/**
 * Two questions instead of six datetime pickers.
 *
 * PRD 1.3: the plan and build windows *are* the format, and presets belong in
 * those windows rather than in new columns. So a host picks when it starts and
 * what shape it is, and the six timestamps derive - with a Custom escape for
 * anyone who wants the old control.
 *
 * The ribbon underneath is the only place the whole run is visible at once,
 * which is what stops an arena shipping with eleven minutes to build in.
 */
export function WhenStep({
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
  const [presetId, setPresetId] = useState<SchedulePresetId>("classic");

  const registrationStart = watch("registrationStart") ?? "";
  const registrationEnd = watch("registrationEnd") ?? "";
  const ideaPhaseEnd = watch("ideaPhaseEnd") ?? "";
  const implPhaseEnd = watch("implPhaseEnd") ?? "";

  /** Recompute all six from whichever of the two anchors just changed. */
  const applyPreset = (id: SchedulePresetId, opensAt: string, startsAt: string) => {
    const preset = findPreset(id);
    if (!preset || !opensAt || !startsAt) return;

    const opens = new Date(opensAt);
    const starts = new Date(startsAt);
    if (Number.isNaN(opens.getTime()) || Number.isNaN(starts.getTime())) return;

    const derived = deriveSchedule({ startsAt: starts, opensAt: opens, preset });
    for (const [field, value] of Object.entries(derived)) {
      setValue(field as keyof ArenaFormInput, value, { shouldValidate: true });
    }
  };

  const isCustom = presetId === "custom";

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Registration opens"
          htmlFor="reg-start"
          error={errors.registrationStart?.message}
        >
          <LineInput
            id="reg-start"
            type="datetime-local"
            invalid={Boolean(errors.registrationStart)}
            {...register("registrationStart", {
              onChange: (e) => applyPreset(presetId, e.target.value, registrationEnd),
            })}
          />
        </Field>

        <Field
          label="Arena starts"
          hint="Registration closes here"
          htmlFor="starts-at"
          error={errors.registrationEnd?.message}
        >
          <LineInput
            id="starts-at"
            type="datetime-local"
            invalid={Boolean(errors.registrationEnd)}
            {...register("registrationEnd", {
              onChange: (e) => applyPreset(presetId, registrationStart, e.target.value),
            })}
          />
        </Field>
      </div>

      <SegmentedChoice
        label="Shape"
        hint="Plan, then build"
        name="schedule-preset"
        columns={2}
        value={presetId}
        onChange={(next) => {
          setPresetId(next);
          applyPreset(next, registrationStart, registrationEnd);
        }}
        options={PRESET_OPTIONS}
      />

      {isCustom && (
        <div className="grid gap-6 border-l-2 border-orange/40 pl-5 sm:grid-cols-2">
          <Field label="Planning starts" htmlFor="idea-start" error={errors.ideaPhaseStart?.message}>
            <LineInput id="idea-start" type="datetime-local" {...register("ideaPhaseStart")} />
          </Field>
          <Field label="Planning ends" htmlFor="idea-end" error={errors.ideaPhaseEnd?.message}>
            <LineInput id="idea-end" type="datetime-local" {...register("ideaPhaseEnd")} />
          </Field>
          <Field label="Building starts" htmlFor="impl-start" error={errors.implPhaseStart?.message}>
            <LineInput id="impl-start" type="datetime-local" {...register("implPhaseStart")} />
          </Field>
          <Field label="Submissions lock" htmlFor="impl-end" error={errors.implPhaseEnd?.message}>
            <LineInput id="impl-end" type="datetime-local" {...register("implPhaseEnd")} />
          </Field>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <FieldLabel as="span">The day</FieldLabel>
        <ClockRibbon
          registrationStart={registrationStart}
          registrationEnd={registrationEnd}
          ideaPhaseEnd={ideaPhaseEnd}
          implPhaseEnd={implPhaseEnd}
        />
      </div>
    </div>
  );
}

export default WhenStep;
