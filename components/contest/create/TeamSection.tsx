"use client";

import { Users } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ContestFormInput } from "@/lib/contest/schema";

interface TeamSectionProps {
  register: UseFormRegister<ContestFormInput>;
  errors: FieldErrors<ContestFormInput>;
  watchIsTeam: boolean;
}

export function TeamSection({ register, errors, watchIsTeam }: TeamSectionProps) {
  return (
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
  );
}

export default TeamSection;
