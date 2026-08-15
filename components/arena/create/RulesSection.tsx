"use client";

import { FileText, Link2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ArenaFormInput } from "@/lib/arena/schema";

interface RulesSectionProps {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
}

export function RulesSection({ register, errors }: RulesSectionProps) {
  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_var(--foreground)]">
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
          <label htmlFor="rulesText" className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            Detailed Rules Text
          </label>
          <textarea
            id="rulesText"
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
  );
}

export default RulesSection;
