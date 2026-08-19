"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  arenaSchema,
  arenaBaseSchema,
  type ArenaFormInput,
  type ArenaFormOutput,
} from "@/lib/arena/schema";
import { useToast } from "@/components/providers/ToastProvider";
import { CreateStepper, type CreateStep } from "@/components/arena/create/CreateStepper";
import { StepPanel } from "@/components/arena/create/fields";
import { FirstRunNote } from "@/components/arena/create/FirstRunNote";
import { deriveSchedule, findPreset, nextWeekendStart } from "@/lib/arena/schedule-presets";
import { BriefStep } from "@/components/arena/create/steps/BriefStep";
import { KindStep } from "@/components/arena/create/steps/KindStep";
import { WhenStep } from "@/components/arena/create/steps/WhenStep";
import { WhereStep } from "@/components/arena/create/steps/WhereStep";
import { WhoStep } from "@/components/arena/create/steps/WhoStep";
import { HandInStep } from "@/components/arena/create/steps/HandInStep";

/**
 * Six steps of one concern each, used to write a brief and to edit one.
 *
 * Extracted from `app/arena/create/page.tsx` when editing arrived. The
 * alternative was a second screen with the same six steps, the same six-way
 * completeness calculation and the same jump-to-the-first-error behaviour -
 * and a host would have found out which copy was stale by having a field
 * silently not save.
 *
 * The two modes differ in three small ways, all of them props: an edit starts
 * from stored values instead of prefilling a schedule, it says "Save changes"
 * rather than "Post the brief", and it does not show the first-run note to
 * someone who has clearly done this before. Everything else is identical
 * because it is the same form.
 *
 * The page above keeps the masthead and decides where a successful submit
 * goes. This owns the fields.
 */

const briefSchema = arenaBaseSchema.pick({ title: true, description: true });
const timelineSchema = arenaBaseSchema.pick({
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
});

type StepId = "brief" | "kind" | "when" | "where" | "who" | "handin";

const CREATE_DEFAULTS: Partial<ArenaFormInput> = {
  difficulty: "INTERMEDIATE",
  locationType: "ONLINE",
  isPrivate: false,
  // Teams, not solo. PRD 1.3 is explicit that the reference format is "small
  // teams, not solo", and this defaulted to `false` with sizes of 1 - so the
  // arena a host got without touching anything was the one shape the product
  // is not about, and every one of them had to notice and change it. Solo is
  // now the deliberate choice rather than the accidental one.
  isTeam: true,
  minTeamSize: 2,
  maxTeamSize: 4,
  allowLeaderAccessControl: true,
  requireGithubUrl: true,
  requireFigmaUrl: false,
  requireVideoUrl: true,
  requireWriteup: true,
};

export interface ArenaFormProps {
  mode: "create" | "edit";
  /** Stored values for an edit. Ignored in create mode. */
  initialValues?: Partial<ArenaFormInput>;
  /**
   * Returns an error message to show, or null on success. The caller does the
   * request, the redirect and the success toast, because "posted" and "saved"
   * are not the same event and neither is this component's to name.
   */
  onSubmit: (payload: ArenaFormOutput) => Promise<string | null>;
}

export function ArenaForm({ mode, initialValues, onSubmit }: ArenaFormProps) {
  const { toast } = useToast();
  const isEdit = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("brief");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ArenaFormInput, unknown, ArenaFormOutput>({
    resolver: zodResolver(arenaSchema),
    defaultValues: isEdit ? initialValues : CREATE_DEFAULTS,
  });

  const title = useWatch({ control, name: "title" });
  const description = useWatch({ control, name: "description" });
  const isPrivate = useWatch({ control, name: "isPrivate" }) ?? false;
  const isTeam = useWatch({ control, name: "isTeam" }) ?? false;
  const inviteCode = useWatch({ control, name: "inviteCode" });
  const locationType = useWatch({ control, name: "locationType" }) ?? "ONLINE";
  const locationName = useWatch({ control, name: "locationName" });
  // minTeamSize/maxTeamSize are `z.coerce.number()`, so the registered number
  // input hands back a string. Coerce the way the schema does, or the
  // comparison below is lexicographic and "10" < "2".
  const minTeam = Number(useWatch({ control, name: "minTeamSize" }));
  const maxTeam = Number(useWatch({ control, name: "maxTeamSize" }));
  const regStart = useWatch({ control, name: "registrationStart" });
  const regEnd = useWatch({ control, name: "registrationEnd" });
  const ideaStart = useWatch({ control, name: "ideaPhaseStart" });
  const ideaEnd = useWatch({ control, name: "ideaPhaseEnd" });
  const implStart = useWatch({ control, name: "implPhaseStart" });
  const implEnd = useWatch({ control, name: "implPhaseEnd" });

  const steps: CreateStep[] = useMemo(
    () => [
      {
        id: "brief",
        label: "The brief",
        complete: briefSchema.safeParse({ title, description }).success,
      },
      // Difficulty always holds a value, so this step cannot be incomplete.
      { id: "kind", label: "How hard", complete: true },
      {
        id: "when",
        label: "When",
        complete: timelineSchema.safeParse({
          registrationStart: regStart,
          registrationEnd: regEnd,
          ideaPhaseStart: ideaStart,
          ideaPhaseEnd: ideaEnd,
          implPhaseStart: implStart,
          implPhaseEnd: implEnd,
        }).success,
      },
      {
        id: "where",
        label: "Where",
        complete: locationType === "ONLINE" || Boolean(locationName),
      },
      {
        id: "who",
        label: "Who",
        complete:
          (!isTeam || (minTeam >= 1 && maxTeam >= minTeam)) &&
          (!isPrivate || Boolean(inviteCode)),
      },
      { id: "handin", label: "Hand in", complete: true },
    ],
    [
      title, description, regStart, regEnd, ideaStart, ideaEnd, implStart, implEnd,
      locationType, locationName, isTeam, minTeam, maxTeam, isPrivate, inviteCode,
    ]
  );

  /**
   * Prefill the machinery, never the brief. Create only.
   *
   * The form used to open with six empty datetime fields, so the first thing a
   * host met was the most tedious part of the job - and an arena cannot be
   * posted without all six. Registration opens now, the arena starts next
   * Saturday at 10:00, and the shape is Classic, which is a complete and valid
   * day someone can post after writing two fields.
   *
   * Title and description are deliberately left empty. Prefilling those would
   * get the example posted verbatim, and the brief is the one part that has to
   * be the host's.
   *
   * An edit already has six real dates, and overwriting them with a fresh
   * weekend would silently reschedule an arena people had entered.
   *
   * Runs once, and only into empty fields, so it cannot overwrite anything
   * typed. `Date.now()` is read here rather than inside the pure helper, which
   * takes `now` as a parameter for exactly this reason.
   */
  // A ref, not state: this only has to stop the effect running twice, and
  // nothing renders from it. As state it would be a setState inside an effect,
  // which schedules a second render pass for a value no one reads.
  const prefilled = useRef(false);
  useEffect(() => {
    if (isEdit || prefilled.current || regStart || regEnd) return;

    const now = new Date();
    const derived = deriveSchedule({
      startsAt: nextWeekendStart(now),
      opensAt: now,
      preset: findPreset("classic")!,
    });

    for (const [field, value] of Object.entries(derived)) {
      setValue(field as keyof ArenaFormInput, value);
    }
    prefilled.current = true;
  }, [isEdit, regStart, regEnd, setValue]);

  const activeIndex = steps.findIndex((s) => s.id === activeStep);
  const isLastStep = activeIndex === steps.length - 1;
  const readyCount = steps.filter((s) => s.complete).length;

  const submit = async (data: ArenaFormOutput) => {
    setIsSubmitting(true);
    try {
      const error = await onSubmit({
        ...data,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        ideaPhaseStart: new Date(data.ideaPhaseStart).toISOString(),
        ideaPhaseEnd: new Date(data.ideaPhaseEnd).toISOString(),
        implPhaseStart: new Date(data.implPhaseStart).toISOString(),
        implPhaseEnd: new Date(data.implPhaseEnd).toISOString(),
      });
      if (error) toast(error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Invalid fields can sit on a step that is not open, where the reader will
   * never find the message. Jump to the first step carrying an error instead of
   * failing silently on the submit button.
   */
  const onInvalid = () => {
    const firstIncomplete = steps.find((s) => !s.complete);
    if (firstIncomplete) setActiveStep(firstIncomplete.id as StepId);
    toast("Some steps still need an answer.", "error");
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:px-10">
      {/* The rail sits on its own surface so the tabs read as a control
          strip rather than as a line of links floating on the page. */}
      <div className="border border-foreground/15 bg-card px-4 md:px-6">
        <CreateStepper
          steps={steps}
          activeId={activeStep}
          onSelect={(id) => setActiveStep(id as StepId)}
        />
      </div>

      <form onSubmit={handleSubmit(submit, onInvalid)} noValidate>
        {!isEdit && (
          <div className="pt-6">
            <FirstRunNote />
          </div>
        )}
        {/* Every step stays mounted. Unmounting the inactive ones would drop
            their registered inputs from react-hook-form, so a value typed on
            step one would be gone by the time step six submits. */}
        <div className="py-8 md:py-10">
          <div hidden={activeStep !== "brief"} className="step-in">
            <StepPanel
              index={1}
              title="The brief"
              lead="The challenge itself, and what teams are allowed to assume. Both are public - the brief is the reason anyone clicks."
            >
              <BriefStep register={register} errors={errors} watch={watch} />
            </StepPanel>
          </div>
          <div hidden={activeStep !== "kind"} className="step-in">
            <StepPanel
              index={2}
              title="How hard"
              lead="Difficulty is the one signal a reader uses to decide whether to attempt it."
            >
              <KindStep watch={watch} setValue={setValue} />
            </StepPanel>
          </div>
          <div hidden={activeStep !== "when"} className="step-in">
            <StepPanel
              index={3}
              title="When"
              lead={
                isEdit
                  ? "A window that has already passed can be extended, but not pulled back - people entered against the dates as they stood."
                  : "Pick a start and a shape; the six phase windows follow from them."
              }
            >
              <WhenStep register={register} errors={errors} watch={watch} setValue={setValue} />
            </StepPanel>
          </div>
          <div hidden={activeStep !== "where"} className="step-in">
            <StepPanel index={4} title="Where" lead="Online, or everyone in one room.">
              <WhereStep register={register} errors={errors} watch={watch} setValue={setValue} />
            </StepPanel>
          </div>
          <div hidden={activeStep !== "who"} className="step-in">
            <StepPanel index={5} title="Who" lead="Team shape, and who is allowed in.">
              <WhoStep register={register} errors={errors} watch={watch} setValue={setValue} />
            </StepPanel>
          </div>
          <div hidden={activeStep !== "handin"} className="step-in">
            <StepPanel index={6} title="Hand in" lead="What a team has to produce by the time submissions lock.">
              <HandInStep
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </StepPanel>
          </div>
        </div>

        {/* Sticky inside the form, not fixed to the window.
            Fixed-to-the-window pinned it above everything for the whole page,
            which meant the site footer could never be reached - it sat under
            a bar that never went away. Sticky bottom-0 on a child of the form
            rides the viewport while the form is taller than it and then comes
            to rest at the form's end, so scrolling past releases it.

            Static below `md`: a bar pinned to the bottom of a phone fights
            the browser's own chrome, and the steps are short enough there
            that the actions arrive on their own. */}
        <div className="static bottom-0 z-30 border border-foreground/15 bg-background/95 backdrop-blur md:sticky">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <span className="font-mono text-[0.55rem] uppercase tracking-wider tabular-nums text-muted-foreground">
              {readyCount} of {steps.length} ready
            </span>

            <div className="flex items-center gap-3">
              {activeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(steps[activeIndex - 1].id as StepId)}
                  className="cursor-pointer border-b border-transparent px-1 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  &larr; Back
                </button>
              )}

              {/* An edit can be saved from any step. Someone who came here to
                  fix a typo in the title should not have to walk to step six
                  to commit it; a first-time host, walking the steps in order,
                  still meets the submit button where the sequence ends. */}
              {!isLastStep && (
                <button
                  type="button"
                  onClick={() => setActiveStep(steps[activeIndex + 1].id as StepId)}
                  className="cursor-pointer border-2 border-foreground bg-foreground px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-background shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:bg-transparent hover:text-foreground hover:shadow-none active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  {steps[activeIndex + 1].label} &rarr;
                </button>
              )}

              {(isLastStep || isEdit) && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer border-2 border-orange bg-orange px-6 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {isSubmitting
                    ? isEdit
                      ? "Saving…"
                      : "Posting…"
                    : isEdit
                      ? "Save changes"
                      : "Post the brief"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ArenaForm;
