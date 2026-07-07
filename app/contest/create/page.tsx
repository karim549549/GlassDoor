"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trophy, Calendar, Users, Shield, Link2, FileText, ArrowRight } from "lucide-react";

// Form Validation Schema using Zod
const contestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPrivate: z.boolean().default(false),
  inviteCode: z.string().optional(),
  
  // Timeline
  registrationStart: z.string().min(1, "Registration start date is required"),
  registrationEnd: z.string().min(1, "Registration end date is required"),
  ideaPhaseStart: z.string().min(1, "Idea phase start date is required"),
  ideaPhaseEnd: z.string().min(1, "Idea phase end date is required"),
  implPhaseStart: z.string().min(1, "Implementation phase start date is required"),
  implPhaseEnd: z.string().min(1, "Implementation end date is required"),
  
  // Teams
  isTeam: z.boolean().default(false),
  minTeamSize: z.coerce.number().min(1, "Min team size is 1").default(1),
  maxTeamSize: z.coerce.number().min(1, "Max team size is 1").default(1),
  maxParticipants: z.coerce.number().optional(),

  // Submission Rules
  requireGithubUrl: z.boolean().default(true),
  requireFigmaUrl: z.boolean().default(false),
  requireVideoUrl: z.boolean().default(false),
  requireWriteup: z.boolean().default(true),
  rulesText: z.string().min(10, "Please provide some rules for the contest"),
}).refine((data) => {
  // Simple validation for dates order
  const regStart = new Date(data.registrationStart);
  const regEnd = new Date(data.registrationEnd);
  return regEnd > regStart;
}, {
  message: "Registration end must be after registration start",
  path: ["registrationEnd"],
});

type ContestFormValues = z.infer<typeof contestSchema>;

export default function CreateContestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContestFormValues>({
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

  const watchIsPrivate = watch("isPrivate");
  const watchIsTeam = watch("isTeam");

  const onSubmit = async (data: ContestFormValues) => {
    setIsSubmitting(true);
    try {
      // API call to save contest will go here
      console.log("Submitting Contest Data: ", data);
      
      // Temporary redirection
      alert("Contest draft schema created successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 font-sans">
      {/* Header Banner */}
      <div className="border-2 border-foreground bg-card p-6 md:p-10 mb-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent mb-2 flex items-center gap-1.5">
          <Trophy className="h-3 w-3" /> — create a new challenge —
        </div>
        <h1 className="font-display text-3xl md:text-5xl uppercase tracking-tight text-foreground">
          Setup Contest
        </h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-xl font-sans normal-case">
          Configure registration windows, phases, team limits, and submission rules for Egyptian developer cohorts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: General Info */}
        <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
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

            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://example.com/cover-image.jpg"
              error={errors.coverImageUrl?.message}
              {...register("coverImageUrl")}
            />
          </div>
        </div>

        {/* Section 2: Access & Privacy */}
        <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
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

        {/* Section 3: Timeline Phases */}
        <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
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

        {/* Section 4: Team Setup */}
        <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
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

        {/* Section 5: Submissions & Rules */}
        <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
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

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Create Contest <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

      </form>
    </div>
  );
}
