"use client";

import { Trophy } from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ArenaFormInput } from "@/lib/arena/schema";
import { CoverImageUploader } from "./CoverImageUploader";

interface GeneralSectionProps {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
  watchCoverImageUrl: string;
}

export function GeneralSection({ register, errors, setValue, watchCoverImageUrl }: GeneralSectionProps) {
  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
      <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
        <Trophy className="h-4 w-4" /> 01. General Details
      </h2>

      <div className="space-y-6">
        <Input
          label="Arena Title"
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
            placeholder="Give a thorough description about the arena theme, goals, and who should join..."
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

        <CoverImageUploader
          register={register}
          errors={errors}
          setValue={setValue}
          watchCoverImageUrl={watchCoverImageUrl}
        />
      </div>
    </div>
  );
}

export default GeneralSection;
