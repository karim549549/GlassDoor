"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contestSchema, contestBaseSchema, type ContestFormInput, type ContestFormOutput } from "@/lib/contest/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trophy, Calendar, Users, Shield, Link2, FileText, ArrowRight, Image as ImageIcon } from "lucide-react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { useToast } from "@/components/providers/ToastProvider";
import { CropperModal } from "@/components/profile/CropperModal";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { ContestContainer } from "@/components/contest/ContestContainer";
import { ContestCardBody } from "@/components/contest/ContestCard";
import gsap from "gsap";

// Per-section field slices, derived from the single shared schema so a min-length/format
// change there automatically updates the progress HUD below — no hardcoded magic numbers.
const generalSectionSchema = contestBaseSchema.pick({ title: true, description: true, coverImageUrl: true });
const timelineSectionSchema = contestBaseSchema.pick({
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
});
const rulesSectionSchema = contestBaseSchema.pick({ rulesText: true });

export default function CreateContestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Elegant typographic fade-up reveal on page load
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
  const [isUploading, setIsUploading] = useState(false);
  const [cropTarget, setCropTarget] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContestFormInput, unknown, ContestFormOutput>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      isPrivate: false,
      isTeam: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      requireGithubUrl: true,
      requireFigmaUrl: false,
      requireVideoUrl: false,
      requireWriteup: true,
    },
  });

  const watchIsPrivate = watch("isPrivate") as boolean;
  const watchIsTeam = watch("isTeam") as boolean;

  // Watches for Progress HUD Indicators
  const watchTitle = watch("title") as string;
  const watchDescription = watch("description") as string;
  const watchCoverImageUrl = watch("coverImageUrl") as string;
  const watchInviteCode = watch("inviteCode") as string;
  const watchMinTeam = watch("minTeamSize") as number;
  const watchMaxTeam = watch("maxTeamSize") as number;
  const watchRegStart = watch("registrationStart") as string;
  const watchRegEnd = watch("registrationEnd") as string;
  const watchIdeaStart = watch("ideaPhaseStart") as string;
  const watchIdeaEnd = watch("ideaPhaseEnd") as string;
  const watchImplStart = watch("implPhaseStart") as string;
  const watchImplEnd = watch("implPhaseEnd") as string;
  const watchRulesText = watch("rulesText") as string;

  // Read selected file locally to target state
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("File size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropTarget(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload cropped blob to Supabase
  const handleCroppedUpload = async (blob: Blob) => {
    setIsUploading(true);
    setCropTarget(null); // Close cropper modal

    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/contest/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast(data.error || "Failed to upload cover image.", "error");
      } else {
        setValue("coverImageUrl", data.url, { shouldValidate: true });
        toast("Cover image cropped and uploaded successfully!", "success");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast("Network error. Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Determine section validation states from the shared schema instead of hand-copied
  // rules (min lengths, requiredness). Conditional business rules that aren't expressible
  // as a single field's constraint (invite code only required when private, max team size
  // must be >= min) stay explicit here rather than folded into the schema.
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

  // Calculate completed section count
  const completedCount = [
    isGeneralValid,
    isAccessValid,
    isTeamValid,
    isTimelineValid,
    isRulesValid
  ].filter(Boolean).length;

  const onSubmit = async (data: ContestFormOutput) => {
    setIsSubmitting(true);
    try {
      // Browser Local -> UTC ISO String conversion
      const payload = {
        ...data,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        ideaPhaseStart: new Date(data.ideaPhaseStart).toISOString(),
        ideaPhaseEnd: new Date(data.ideaPhaseEnd).toISOString(),
        implPhaseStart: new Date(data.implPhaseStart).toISOString(),
        implPhaseEnd: new Date(data.implPhaseEnd).toISOString(),
      };

      const res = await fetch("/api/contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast(result.error || "Failed to host arena contest.", "error");
      } else {
        toast("Arena contest hosted successfully!", "success");
        router.push("/contest");
      }
    } catch (err) {
      console.error(err);
      toast("Network error. Failed to save contest.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden pt-0">
      {/* Editorial Background Blueprint Grid */}
      <BackgroundGrid opacity={0.08} />

      {/* Setup Contest Masthead Header using decoupled reusable component */}
      <ContestHeader
        subtitle="[HOSTING PORTAL SYSTEM DIRECTORY]"
        title="Setup Arena Contest"
        description="Cairo Issue 002 · Configure registration windows, phases, team limits, and submission rules for Egyptian developer cohorts."
        animationHooks={{
          subtitle: "masthead-subtitle opacity-0",
          title: "masthead-title opacity-0",
          description: "masthead-desc opacity-0",
        }}
      >
        <div className="border-2 border-dashed border-[#F1EFE9]/25 bg-[#F1EFE9]/5 p-4 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(241,239,233,0.06)]">
          <span className="font-mono text-[0.45rem] text-[#F1EFE9]/50 uppercase tracking-[0.25em] font-bold block mb-2">
            [LIVE CARD PREVIEW]
          </span>
          
          <div className="group block bg-[#FAF8F5] text-[#0E0E0D] border-2 border-[#0E0E0D] p-4 relative shadow-[2px_2px_0px_0px_#0E0E0D] pointer-events-none">
            <ContestCardBody
              contest={{
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
      </ContestHeader>

      <ContestContainer className="py-12 md:py-16 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Two-Column Form Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Width 8/12): Main Configurations */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Section 1: General Info */}
              <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
                <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
                  <Trophy className="h-4 w-4" /> 01. General Details
                </h2>
                
                <div className="space-y-6">
                  <Input
                    label="Contest Title"
                    placeholder="e.g. Egypt React Winter Hackathon 2026"
                    error={errors.title?.message}
                    {...register("title")}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Description / Overview
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Give a thorough description about the contest theme, goals, and who should join..."
                      className={`w-full bg-secondary border border-border px-3 py-2.5 text-sm font-sans placeholder-muted-foreground/60 focus:outline-none focus:border-foreground/45 transition-colors duration-200 resize-none ${
                        errors.description ? "border-accent" : ""
                      }`}
                      {...register("description")}
                    />
                    {errors.description && (
                      <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide">
                        {errors.description.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Upload Cover Image (Required)
                    </label>
                    
                    <div className="border-2 border-dashed border-foreground/30 bg-secondary/20 p-5 text-center relative hover:bg-secondary/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange mb-2" />
                          <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                            Uploading image to storage...
                          </span>
                        </div>
                      ) : watchCoverImageUrl ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={watchCoverImageUrl}
                            alt="Uploaded cover preview"
                            className="w-48 aspect-[4/1] object-cover border border-foreground/20 shadow-[2px_2px_0px_0px_#0E0E0D]"
                          />
                          <span className="font-mono text-[0.55rem] uppercase tracking-wider text-orange font-bold">
                            [✓] IMAGE UPLOADED (CLICK TO CHANGE)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1.5" />
                          <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[#0E0E0D] font-bold block">
                            Drag & drop image file or Click to browse
                          </span>
                          <span className="font-mono text-[0.48rem] uppercase tracking-widest text-muted-foreground block mt-0.5">
                            PNG, JPEG, WEBP · Max 5MB
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Register coverImageUrl hidden input to satisfy react-hook-form schema validations */}
                    <input type="hidden" {...register("coverImageUrl")} />
                    
                    {errors.coverImageUrl && (
                      <span className="font-mono text-[0.6rem] text-accent tracking-wide mt-0.5">
                        {errors.coverImageUrl.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Access & Privacy */}
              <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
                <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
                  <Shield className="h-4 w-4" /> 02. Access & Security
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-secondary border border-border">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      className="h-4 w-4 accent-accent cursor-pointer rounded-none"
                      {...register("isPrivate")}
                    />
                    <label htmlFor="isPrivate" className="font-mono text-[0.68rem] uppercase tracking-wider text-foreground cursor-pointer select-none">
                      Make this contest private (Invite only)
                    </label>
                  </div>

                  {watchIsPrivate && (
                    <div className="p-4 border border-dashed border-foreground/30 space-y-4">
                      <Input
                        label="Invitation / Invite Code"
                        placeholder="e.g. PRIVATE-ARENA-2026"
                        error={errors.inviteCode?.message}
                        {...register("inviteCode")}
                      />
                      <p className="font-mono text-[0.55rem] text-muted-foreground lowercase normal-case">
                        Contestants will need to enter this code to view or join the contest details.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Team Setup */}
              <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
                <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
                  <Users className="h-4 w-4" /> 04. Team Configurations
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-secondary border border-border">
                    <input
                      type="checkbox"
                      id="isTeam"
                      className="h-4 w-4 accent-accent cursor-pointer"
                      {...register("isTeam")}
                    />
                    <label htmlFor="isTeam" className="font-mono text-[0.68rem] uppercase tracking-wider text-foreground cursor-pointer select-none">
                      Enable Team Participation (Instead of Solo)
                    </label>
                  </div>

                  {watchIsTeam && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-dashed border-foreground/30">
                      <Input
                        type="number"
                        label="Minimum Members per Team"
                        error={errors.minTeamSize?.message}
                        {...register("minTeamSize")}
                      />
                      <Input
                        type="number"
                        label="Maximum Members per Team"
                        error={errors.maxTeamSize?.message}
                        {...register("maxTeamSize")}
                      />
                    </div>
                  )}

                  <Input
                    type="number"
                    label="Maximum Registered Teams/Solos Cap (Optional)"
                    placeholder="e.g. 50"
                    error={errors.maxParticipants?.message}
                    {...register("maxParticipants")}
                  />
                </div>
              </div>

              {/* Section 3: Timeline Phases */}
              <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
                <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
                  <Calendar className="h-4 w-4" /> 03. Timeline & Phases
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="datetime-local"
                    label="Registration Open"
                    error={errors.registrationStart?.message}
                    {...register("registrationStart")}
                  />
                  <Input
                    type="datetime-local"
                    label="Registration Close"
                    error={errors.registrationEnd?.message}
                    {...register("registrationEnd")}
                  />

                  <Input
                    type="datetime-local"
                    label="Idea Phase Start"
                    error={errors.ideaPhaseStart?.message}
                    {...register("ideaPhaseStart")}
                  />
                  <Input
                    type="datetime-local"
                    label="Idea Phase End"
                    error={errors.ideaPhaseEnd?.message}
                    {...register("ideaPhaseEnd")}
                  />

                  <Input
                    type="datetime-local"
                    label="Coding/Impl Start"
                    error={errors.implPhaseStart?.message}
                    {...register("implPhaseStart")}
                  />
                  <Input
                    type="datetime-local"
                    label="Coding/Impl End"
                    error={errors.implPhaseEnd?.message}
                    {...register("implPhaseEnd")}
                  />
                </div>
              </div>

              {/* Section 5: Submissions & Rules */}
              <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
                <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
                  <FileText className="h-4 w-4" /> 05. Submission Deliverables & Rules
                </h2>

                <div className="space-y-6">
                  <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground block mb-2">
                    Deliverables Required at Submission Phase
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3.5 bg-secondary border border-border">
                      <input
                        type="checkbox"
                        id="requireGithubUrl"
                        className="h-4 w-4 accent-accent cursor-pointer"
                        {...register("requireGithubUrl")}
                      />
                      <label htmlFor="requireGithubUrl" className="font-mono text-[0.65rem] uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-1.5">
                        <Link2 className="h-3 w-3" /> GitHub Repository URL
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-secondary border border-border">
                      <input
                        type="checkbox"
                        id="requireFigmaUrl"
                        className="h-4 w-4 accent-accent cursor-pointer"
                        {...register("requireFigmaUrl")}
                      />
                      <label htmlFor="requireFigmaUrl" className="font-mono text-[0.65rem] uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-1.5">
                        <Link2 className="h-3 w-3" /> Figma Design URL
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-secondary border border-border">
                      <input
                        type="checkbox"
                        id="requireVideoUrl"
                        className="h-4 w-4 accent-accent cursor-pointer"
                        {...register("requireVideoUrl")}
                      />
                      <label htmlFor="requireVideoUrl" className="font-mono text-[0.65rem] uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-1.5">
                        <Link2 className="h-3 w-3" /> Demo / Presentation Video URL
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-secondary border border-border">
                      <input
                        type="checkbox"
                        id="requireWriteup"
                        className="h-4 w-4 accent-accent cursor-pointer"
                        {...register("requireWriteup")}
                      />
                      <label htmlFor="requireWriteup" className="font-mono text-[0.65rem] uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> Submission Writeup/Summary
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-6">
                    <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Detailed Rules Text
                    </label>
                    <textarea
                      rows={6}
                      placeholder="List detailed rules, judging rubrics, codes of conduct, and terms of service here..."
                      className={`w-full bg-secondary border border-border px-3 py-2.5 text-sm font-sans placeholder-muted-foreground/60 focus:outline-none focus:border-foreground/45 transition-colors duration-200 resize-none ${
                        errors.rulesText ? "border-accent" : ""
                      }`}
                      {...register("rulesText")}
                    />
                    {errors.rulesText && (
                      <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide">
                        {errors.rulesText.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Width 4/12): Sticky Progress HUD & Actions */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              {/* Progress HUD Box - Solid dark console theme for high contrast */}
              <div className="border-2 border-[#FAF8F5]/15 bg-[#0E0E0D] text-[#F1EFE9] p-5 shadow-[4px_4px_0px_0px_#0E0E0D] relative overflow-hidden">
                {/* Visual grids inside HUD */}
                <div className="absolute inset-1 border border-[#F1EFE9]/10 pointer-events-none" />
                
                <span className="font-mono text-[0.48rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
                  [PROGRESS REGISTER HUD]
                </span>
                <h3 className="font-display italic text-lg uppercase tracking-tight text-[#F1EFE9] border-b border-[#F1EFE9]/15 pb-2.5 mb-4">
                  Arena Specifications
                </h3>

                {/* Section checklist */}
                <ul className="space-y-3 font-mono text-[0.62rem] uppercase tracking-wider text-[#F1EFE9] mb-6">
                  <li className="flex items-center justify-between gap-3">
                    <span className={isGeneralValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
                      01. GENERAL DETAILS
                    </span>
                    <span className={`font-bold shrink-0 ${isGeneralValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
                      {isGeneralValid ? "[✓] DONE" : "[ ] PENDING"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className={isAccessValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
                      02. ACCESS SECURITY
                    </span>
                    <span className={`font-bold shrink-0 ${isAccessValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
                      {isAccessValid ? "[✓] DONE" : "[ ] PENDING"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className={isTeamValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
                      03. TEAM LIMITS
                    </span>
                    <span className={`font-bold shrink-0 ${isTeamValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
                      {isTeamValid ? "[✓] DONE" : "[ ] PENDING"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className={isTimelineValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
                      04. RUN TIMELINE
                    </span>
                    <span className={`font-bold shrink-0 ${isTimelineValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
                      {isTimelineValid ? "[✓] DONE" : "[ ] PENDING"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className={isRulesValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
                      05. RULES & LAWS
                    </span>
                    <span className={`font-bold shrink-0 ${isRulesValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
                      {isRulesValid ? "[✓] DONE" : "[ ] PENDING"}
                    </span>
                  </li>
                </ul>

                {/* Progress bar info */}
                <div className="border-t border-[#F1EFE9]/15 pt-3.5 mt-4 flex justify-between items-center text-[0.55rem] font-mono font-bold tracking-widest text-[#F1EFE9]">
                  <span>COMPLETION RATIO:</span>
                  <span className="text-orange">{completedCount} / 5 SECS</span>
                </div>
                <div className="w-full bg-[#FAF8F5]/10 h-1.5 border border-[#FAF8F5]/20 mt-2 relative">
                  <div
                    className="bg-orange h-full transition-all duration-300"
                    style={{ width: `${(completedCount / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Action Buttons Panel */}
              <div className="border-2 border-[#0E0E0D] bg-[#FAF8F5] p-5 shadow-[4px_4px_0px_0px_#0E0E0D] relative overflow-hidden flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full py-3 bg-orange text-white hover:bg-transparent hover:text-[#0E0E0D] hover:border-[#0E0E0D] font-mono text-[0.62rem] font-bold tracking-[0.2em] uppercase border border-orange shadow-[2px_2px_0px_0px_rgba(14,14,13,1)] hover:shadow-none active:translate-y-0.5 transition-all duration-150"
                >
                  Create Arena <ArrowRight className="h-3.5 w-3.5 ml-1 inline-block align-middle" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full py-2.5 font-mono text-[0.58rem] font-bold tracking-wider uppercase border-2 border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#FAF8F5] shadow-[2px_2px_0px_0px_rgba(14,14,13,1)] hover:shadow-none active:translate-y-0.5 transition-all duration-150"
                >
                  Cancel
                </Button>
              </div>

            </div>

          </div>

        </form>
      </ContestContainer>

      {/* Cropper Modal for Event Cover Image */}
      <CropperModal
        isOpen={!!cropTarget}
        onClose={() => setCropTarget(null)}
        imageSrc={cropTarget}
        aspectRatio={3} // 3 represents the cover crop ratio (4:1)
        onCropComplete={handleCroppedUpload}
        isLoading={isUploading}
      />
    </div>
  );
}
