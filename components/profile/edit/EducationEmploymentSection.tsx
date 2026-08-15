import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { SearchableDropdown, type DropdownOption } from "@/components/ui/SearchableDropdown";
import {
  EMPLOYER_REQUIRED_STATUSES,
  EMPLOYMENT_STATUS_VALUES,
  type EmploymentStatus,
  type ProfileFormInput,
} from "@/lib/profile/schema";
import { SENIORITY_VALUES, SENIORITY_LABELS } from "@/lib/taxonomy/seniority";

const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  UNEMPLOYED: "Looking For Work",
  EMPLOYED: "Employed Full-Time",
  FREELANCER: "Freelancing",
  INTERN: "Internship",
  STUDENT: "Student",
};

// Seniority labels come from lib/taxonomy/seniority.ts. A local map here was
// part of the three-way drift that module now resolves.

interface EducationEmploymentSectionProps {
  register: UseFormRegister<ProfileFormInput>;
  errors: FieldErrors<ProfileFormInput>;
  employmentStatus: string;
  dbJobTypes: DropdownOption[];
  selectedJobType: string;
  onJobTypeChange: (value: string) => void;
}

export function EducationEmploymentSection({
  register,
  errors,
  employmentStatus,
  dbJobTypes,
  selectedJobType,
  onJobTypeChange,
}: EducationEmploymentSectionProps) {
  const showEmployerField = (EMPLOYER_REQUIRED_STATUSES as readonly string[]).includes(employmentStatus);

  return (
    <div className="space-y-5">
      <h4 className="font-bold border-b-2 border-foreground pb-1 text-foreground text-[0.85rem]">
        2. Employment & Credentials
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label htmlFor="seniority" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Seniority Level
          </label>
          <select
            id="seniority"
            className="w-full p-3 bg-card border border-foreground focus:outline-none rounded-none text-[0.78rem] uppercase cursor-pointer"
            {...register("seniority")}
          >
            <option value="">Select Seniority</option>
            {SENIORITY_VALUES.map((value) => (
              <option key={value} value={value}>
                {SENIORITY_LABELS[value]}
              </option>
            ))}
          </select>
          {errors.seniority && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.seniority.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentStatus" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Employment Status
          </label>
          <select
            id="employmentStatus"
            className="w-full p-3 bg-card border border-foreground focus:outline-none rounded-none text-[0.78rem] uppercase cursor-pointer"
            {...register("employmentStatus")}
          >
            <option value="">Select Status</option>
            {EMPLOYMENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          {errors.employmentStatus && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.employmentStatus.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="currentEmployer" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
            Current Employer
          </label>
          <input
            id="currentEmployer"
            type="text"
            disabled={!showEmployerField}
            className={`w-full p-3 border border-foreground focus:outline-none rounded-none uppercase text-[0.78rem] ${
              showEmployerField ? "bg-card" : "bg-gray-200 cursor-not-allowed opacity-50"
            }`}
            placeholder={showEmployerField ? "e.g. Google" : "Not Employed"}
            {...register("currentEmployer")}
          />
          {errors.currentEmployer && (
            <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
              ⚠️ {errors.currentEmployer.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <SearchableDropdown
          label="Current Job Title"
          options={dbJobTypes}
          value={selectedJobType}
          onChange={onJobTypeChange}
          placeholder="Search Current Job Title..."
          error={errors.jobTypes?.message}
        />
      </div>
    </div>
  );
}
