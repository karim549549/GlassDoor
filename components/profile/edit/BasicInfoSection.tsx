import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { EGYPTIAN_UNIVERSITIES, EGYPT_LOCATIONS } from "@/lib/profile/constants";
import type { ProfileFormInput } from "@/lib/profile/schema";

interface BasicInfoSectionProps {
  register: UseFormRegister<ProfileFormInput>;
  errors: FieldErrors<ProfileFormInput>;
  education: string;
  location: string;
  onEducationChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export function BasicInfoSection({
  register,
  errors,
  education,
  location,
  onEducationChange,
  onLocationChange,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-5">
      <h4 className="font-bold border-b-2 border-foreground pb-1 text-foreground text-[0.85rem]">
        1. Personal Credentials
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem]"
            placeholder="e.g. Karim Khaled"
            {...register("fullName")}
          />
          {errors.fullName && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.fullName.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="handle" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Arena Handle (Codename)
          </label>
          <input
            id="handle"
            type="text"
            className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
            placeholder="e.g. karim_99"
            {...register("handle")}
          />
          {errors.handle && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.handle.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SearchableDropdown
          label="Education (Egyptian University)"
          options={EGYPTIAN_UNIVERSITIES}
          value={education}
          onChange={onEducationChange}
          placeholder="Search Egyptian University..."
          error={errors.education?.message}
        />
        <SearchableDropdown
          label="Location (Egypt Governorate)"
          options={EGYPT_LOCATIONS}
          value={location}
          onChange={onLocationChange}
          placeholder="Search Egypt Governorate..."
          error={errors.location?.message}
        />
      </div>
    </div>
  );
}
