"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  arenaSchema,
  arenaBaseSchema,
  type ArenaFormInput,
  type ArenaFormOutput,
} from "@/lib/arena/schema";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import { CreateStepper, type CreateStep } from "@/components/arena/create/CreateStepper";
import { StepPanel } from "@/components/arena/create/fields";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { BriefStep } from "@/components/arena/create/steps/BriefStep";
import { KindStep } from "@/components/arena/create/steps/KindStep";
import { WhenStep } from "@/components/arena/create/steps/WhenStep";
import { WhereStep } from "@/components/arena/create/steps/WhereStep";
import { WhoStep } from "@/components/arena/create/steps/WhoStep";
import { HandInStep } from "@/components/arena/create/steps/HandInStep";

/**
 * Write a brief.
 *
 * The page this replaces opened with a near-black masthead - `pt-24 pb-12` of
 * `bg-foreground` carrying a shrunken preview of the arena card in a second
 * column - which together took roughly the top half of the viewport before a
 * single field. Beside the form sat a "[PROGRESS REGISTER HUD]" listing the
 * same sections again with strikethrough: two panels showing state, neither
 * taking input.
 *
 * The band stays, because it is what makes this page look like the rest of the
 * site - at a third of the height, with nothing beside the title. The preview
 * is gone (it previewed a card design that no longer exists, arenas having
 * lost their cover image) and so is the HUD, because progress now lives in the
 * step rail where it is also the navigation.
 *
 * Below it, six steps of one concern each. Free navigation rather than a
 * wizard: a host who wants to set the clock first should be able to.
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

export default function CreateArenaPage() {
  const router = useRouter();
  const { toast } = useToast();
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
    defaultValues: {
      domain: "FULL_STACK_WEB",
      difficulty: "INTERMEDIATE",
      locationType: "ONLINE",
      isPrivate: false,
      isTeam: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      allowLeaderAccessControl: true,
      requireGithubUrl: true,
      requireFigmaUrl: false,
      requireVideoUrl: true,
      requireWriteup: true,
      tags: [],
    },
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
      // Domain and difficulty always hold a value, so this step cannot be
      // incomplete - it is marked done once the reader has been past it, which
      // is what the default marks anyway.
      { id: "kind", label: "What kind", complete: true },
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

  const activeIndex = steps.findIndex((s) => s.id === activeStep);
  const isLastStep = activeIndex === steps.length - 1;
  const readyCount = steps.filter((s) => s.complete).length;

  const onSubmit = async (data: ArenaFormOutput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        ideaPhaseStart: new Date(data.ideaPhaseStart).toISOString(),
        ideaPhaseEnd: new Date(data.ideaPhaseEnd).toISOString(),
        implPhaseStart: new Date(data.implPhaseStart).toISOString(),
        implPhaseEnd: new Date(data.implPhaseEnd).toISOString(),
      };

      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast(result.error || "Could not post the brief.", "error");
        return;
      }

      toast("Brief posted.", "success");
      router.push("/arena");
    } catch (err) {
      logger.error("Arena creation failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast("Network error. The brief was not posted.", "error");
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
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      {/* The masthead, kept but cut down. The version this replaces ran
          `pt-24 pb-12` and carried a live preview of the arena card in a second
          column, which together took roughly the top half of the viewport
          before a single field. The band and its blueprint grid are what make
          this page look like the rest of the site, so they stay - at a third
          of the height, and with nothing beside the title. */}
      <div className="relative w-full overflow-hidden border-b-2 border-orange bg-foreground text-background">
        <BackgroundGrid opacity={0.06} patternSize={28} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <span className="font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
            [ New brief ]
          </span>
          <h1 className="mt-2 font-display text-[clamp(1.4rem,3vw,2.1rem)] italic leading-tight text-background">
            Write something you would want to build on a Saturday
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:px-10">
        {/* The rail sits on its own surface so the tabs read as a control
            strip rather than as a line of links floating on the page. */}
        <div className="border border-foreground/15 bg-card px-4 md:px-6">
          <CreateStepper
            steps={steps}
            activeId={activeStep}
            onSelect={(id) => setActiveStep(id as StepId)}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {/* Every step stays mounted. Unmounting the inactive ones would drop
              their registered inputs from react-hook-form, so a value typed on
              step one would be gone by the time step six submits. */}
          <div className="py-8 md:py-10">
            <div hidden={activeStep !== "brief"}>
              <StepPanel
                index={1}
                title="The brief"
                lead="The challenge itself, and what teams are allowed to assume. Both are public - the brief is the reason anyone clicks."
              >
                <BriefStep register={register} errors={errors} watch={watch} />
              </StepPanel>
            </div>
            <div hidden={activeStep !== "kind"}>
              <StepPanel
                index={2}
                title="What kind"
                lead="Domain decides which ladder a result counts on. Difficulty decides what it is worth."
              >
                <KindStep watch={watch} setValue={setValue} />
              </StepPanel>
            </div>
            <div hidden={activeStep !== "when"}>
              <StepPanel
                index={3}
                title="When"
                lead="Pick a start and a shape; the six phase windows follow from them."
              >
                <WhenStep register={register} errors={errors} watch={watch} setValue={setValue} />
              </StepPanel>
            </div>
            <div hidden={activeStep !== "where"}>
              <StepPanel index={4} title="Where" lead="Online, or everyone in one room.">
                <WhereStep register={register} errors={errors} watch={watch} setValue={setValue} />
              </StepPanel>
            </div>
            <div hidden={activeStep !== "who"}>
              <StepPanel index={5} title="Who" lead="Team shape, and who is allowed in.">
                <WhoStep register={register} errors={errors} watch={watch} setValue={setValue} />
              </StepPanel>
            </div>
            <div hidden={activeStep !== "handin"}>
              <StepPanel index={6} title="Hand in" lead="What a team has to produce by the time submissions lock.">
                <HandInStep register={register} errors={errors} watch={watch} setValue={setValue} />
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
                    className="border-b border-transparent px-1 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                  >
                    &larr; Back
                  </button>
                )}

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(steps[activeIndex + 1].id as StepId)}
                    className="border-2 border-foreground bg-transparent px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                  >
                    {steps[activeIndex + 1].label} &rarr;
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="border-2 border-orange bg-orange px-6 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {isSubmitting ? "Posting…" : "Post the brief"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
