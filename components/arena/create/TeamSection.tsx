"use client";

import { Users } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ArenaFormInput } from "@/lib/arena/schema";

interface TeamSectionProps {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  watchIsTeam: boolean;
}

export function TeamSection({ register, errors, watchIsTeam }: TeamSectionProps) {
  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_var(--foreground)]">
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
          <div className="space-y-4 p-4 border border-dashed border-foreground/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Team Leader Privacy Access Control Toggle */}
            <div className="pt-3 border-t border-dashed border-foreground/20">
              <div className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/20">
                <input
                  type="checkbox"
                  id="allowLeaderAccessControl"
                  className="h-4 w-4 accent-orange cursor-pointer"
                  {...register("allowLeaderAccessControl")}
                />
                <label
                  htmlFor="allowLeaderAccessControl"
                  className="font-mono text-[0.62rem] uppercase tracking-wider text-foreground font-bold cursor-pointer select-none"
                >
                  Allow Team Leaders to Configure Team Privacy (Public / Request / Private)
                </label>
              </div>
              <p className="font-mono text-[0.52rem] text-muted-foreground mt-1 px-1">
                If unchecked, all team lobbies created in this arena will inherit the arena&apos;s global privacy mode.
              </p>
              {errors.allowLeaderAccessControl?.message && (
                <span className="font-mono text-[0.55rem] text-red-600 font-bold block mt-1">
                  {errors.allowLeaderAccessControl.message}
                </span>
              )}
            </div>
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
