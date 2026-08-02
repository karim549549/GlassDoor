"use client";

import { Calendar } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ContestFormInput } from "@/lib/contest/schema";

interface TimelineSectionProps {
  register: UseFormRegister<ContestFormInput>;
  errors: FieldErrors<ContestFormInput>;
}

export function TimelineSection({ register, errors }: TimelineSectionProps) {
  return (
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
  );
}

export default TimelineSection;
