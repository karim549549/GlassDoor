import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProfileFormInput } from "@/lib/profile/schema";

interface LinksSectionProps {
  register: UseFormRegister<ProfileFormInput>;
  errors: FieldErrors<ProfileFormInput>;
}

export function LinksSection({ register, errors }: LinksSectionProps) {
  return (
    <div className="space-y-5">
      <h4 className="font-bold border-b-2 border-foreground pb-1 text-foreground text-[0.85rem]">
        4. Social Links (URLs)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label htmlFor="githubUrl" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            GitHub Profile URL
          </label>
          <input
            id="githubUrl"
            type="text"
            className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
            placeholder="https://github.com/..."
            {...register("githubUrl")}
          />
          {errors.githubUrl && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.githubUrl.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="linkedinUrl" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            LinkedIn Profile URL
          </label>
          <input
            id="linkedinUrl"
            type="text"
            className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
            placeholder="https://linkedin.com/in/..."
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.linkedinUrl.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="portfolioUrl" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Portfolio Website URL
          </label>
          <input
            id="portfolioUrl"
            type="text"
            className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
            placeholder="https://portfolio.dev"
            {...register("portfolioUrl")}
          />
          {errors.portfolioUrl && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.portfolioUrl.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
