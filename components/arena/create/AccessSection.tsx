"use client";

import { Shield } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ArenaFormInput } from "@/lib/arena/schema";

interface AccessSectionProps {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  watchIsPrivate: boolean;
}

export function AccessSection({ register, errors, watchIsPrivate }: AccessSectionProps) {
  return (
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
            Make this arena private (Invite only)
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
              Contestants will need to enter this code to view or join the arena details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessSection;
