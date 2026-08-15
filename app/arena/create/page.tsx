"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { arenaSchema, arenaBaseSchema, type ArenaFormInput, type ArenaFormOutput } from "@/lib/arena/schema";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { useToast } from "@/components/providers/ToastProvider";
import { ArenaHeader } from "@/components/arena/ArenaHeader";
import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaCardBody } from "@/components/arena/ArenaCard";
import { GeneralSection } from "@/components/arena/create/GeneralSection";
import { AccessSection } from "@/components/arena/create/AccessSection";
import { LocationSection } from "@/components/arena/create/LocationSection";
import { TeamSection } from "@/components/arena/create/TeamSection";
import { TimelineSection } from "@/components/arena/create/TimelineSection";
import { RulesSection } from "@/components/arena/create/RulesSection";
import { ProgressHud } from "@/components/arena/create/ProgressHud";
import { TagSelectionSection } from "@/components/arena/create/TagSelectionSection";
import gsap from "gsap";

const generalSectionSchema = arenaBaseSchema.pick({ title: true, description: true, coverImageUrl: true });
const timelineSectionSchema = arenaBaseSchema.pick({
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
});
const rulesSectionSchema = arenaBaseSchema.pick({ rulesText: true });

export default function CreateArenaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      ".masthead-title",
      { opacity: 0, y: 55 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power4.out", delay: 0.15 }
    );
    gsap.fromTo(
      ".masthead-subtitle",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.4 }
    );
    gsap.fromTo(
      ".masthead-desc",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.55 }
    );
  }, []);

  const { toast } = useToast();

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
      locationType: "ONLINE",
      isPrivate: false,
      isTeam: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      allowLeaderAccessControl: true,
      requireGithubUrl: true,
      requireFigmaUrl: false,
      requireVideoUrl: false,
      requireWriteup: true,
      tags: [],
    },
  });

  const watchIsPrivate = useWatch({ control, name: "isPrivate" }) ?? false;
  const watchIsTeam = useWatch({ control, name: "isTeam" }) ?? false;
  const watchLocationType = useWatch({ control, name: "locationType" }) || "ONLINE";
  const watchGoogleMapsUrl = useWatch({ control, name: "googleMapsUrl" });
  const watchLocationName = useWatch({ control, name: "locationName" });

  const watchTitle = useWatch({ control, name: "title" });
  const watchDescription = useWatch({ control, name: "description" });
  const watchCoverImageUrl = useWatch({ control, name: "coverImageUrl" });
  const watchInviteCode = useWatch({ control, name: "inviteCode" });
  // minTeamSize/maxTeamSize are `z.coerce.number()`, so their form-input type is
  // `unknown` and the raw registered <input type="number"> hands back a string.
  // Coerce here the same way the schema does, so the comparisons below are
  // numeric rather than lexicographic.
  const watchMinTeam = Number(useWatch({ control, name: "minTeamSize" }));
  const watchMaxTeam = Number(useWatch({ control, name: "maxTeamSize" }));
  const watchRegStart = useWatch({ control, name: "registrationStart" });
  const watchRegEnd = useWatch({ control, name: "registrationEnd" });
  const watchIdeaStart = useWatch({ control, name: "ideaPhaseStart" });
  const watchIdeaEnd = useWatch({ control, name: "ideaPhaseEnd" });
  const watchImplStart = useWatch({ control, name: "implPhaseStart" });
  const watchImplEnd = useWatch({ control, name: "implPhaseEnd" });
  const watchRulesText = useWatch({ control, name: "rulesText" });

  const isGeneralValid = generalSectionSchema.safeParse({
    title: watchTitle,
    description: watchDescription,
    coverImageUrl: watchCoverImageUrl,
  }).success;
  const isAccessValid = !watchIsPrivate || !!watchInviteCode;
  const isTeamValid = !watchIsTeam || (watchMinTeam >= 1 && watchMaxTeam >= watchMinTeam);
  const isTimelineValid = timelineSectionSchema.safeParse({
    registrationStart: watchRegStart,
    registrationEnd: watchRegEnd,
    ideaPhaseStart: watchIdeaStart,
    ideaPhaseEnd: watchIdeaEnd,
    implPhaseStart: watchImplStart,
    implPhaseEnd: watchImplEnd,
  }).success;
  const isRulesValid = rulesSectionSchema.safeParse({ rulesText: watchRulesText }).success;

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast(result.error || "Failed to host arena.", "error");
      } else {
        toast("Arena hosted successfully!", "success");
        router.push("/arena");
      }
    } catch (err) {
      console.error(err);
      toast("Network error. Failed to save arena.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      <BackgroundGrid opacity={0.08} />

      <ArenaHeader
        subtitle="[HOSTING PORTAL SYSTEM DIRECTORY]"
        title="Setup Arena"
        description="Cairo Issue 002 · Configure registration windows, phases, team limits, and submission rules for Egyptian developer cohorts."
        animationHooks={{
          subtitle: "masthead-subtitle opacity-0",
          title: "masthead-title opacity-0",
          description: "masthead-desc opacity-0",
        }}
      >
        <div className="border-2 border-dashed border-background/25 bg-background/5 p-4 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(241,239,233,0.06)]">
          <span className="font-mono text-[0.45rem] text-background/50 uppercase tracking-[0.25em] font-bold block mb-2">
            [LIVE CARD PREVIEW]
          </span>

          <div className="group block bg-card text-foreground border-2 border-foreground p-4 relative shadow-[2px_2px_0px_0px_var(--foreground)] pointer-events-none">
            <ArenaCardBody
              arena={{
                title: watchTitle || "UNTITLED ARENA",
                description: watchDescription || "No overview description provided yet. Enter details on the left to sync.",
                coverImageUrl: watchCoverImageUrl,
                status: "REGISTRATION_OPEN",
                isPrivate: watchIsPrivate,
                isTeam: watchIsTeam,
                minTeamSize: watchMinTeam || 1,
                maxTeamSize: watchMaxTeam || 1,
              }}
              footerDate={watchRegStart}
            />
          </div>
        </div>
      </ArenaHeader>

      <ArenaContainer className="py-12 md:py-16 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-8">
              <GeneralSection
                register={register}
                errors={errors}
                setValue={setValue}
                watchCoverImageUrl={watchCoverImageUrl}
              />

              <TagSelectionSection setValue={setValue} watch={watch} />

              <AccessSection register={register} errors={errors} watchIsPrivate={watchIsPrivate} />

              <LocationSection
                register={register}
                errors={errors}
                setValue={setValue}
                watchLocationType={watchLocationType}
                watchGoogleMapsUrl={watchGoogleMapsUrl}
                watchLocationName={watchLocationName}
              />

              <TeamSection register={register} errors={errors} watchIsTeam={watchIsTeam} />

              <TimelineSection register={register} errors={errors} />

              <RulesSection register={register} errors={errors} />
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

              <ProgressHud
                isGeneralValid={isGeneralValid}
                isAccessValid={isAccessValid}
                isTeamValid={isTeamValid}
                isTimelineValid={isTimelineValid}
                isRulesValid={isRulesValid}
              />

              <div className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] relative overflow-hidden flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full py-3 bg-orange text-white hover:bg-transparent hover:text-foreground hover:border-foreground font-mono text-[0.62rem] font-bold tracking-[0.2em] uppercase border border-orange shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none active:translate-y-0.5 transition-all duration-150"
                >
                  Create Arena <ArrowRight className="h-3.5 w-3.5 ml-1 inline-block align-middle" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full py-2.5 font-mono text-[0.58rem] font-bold tracking-wider uppercase border-2 border-foreground bg-card text-foreground hover:bg-foreground hover:text-card shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none active:translate-y-0.5 transition-all duration-150"
                >
                  Cancel
                </Button>
              </div>

            </div>

          </div>

        </form>
      </ArenaContainer>
    </div>
  );
}
