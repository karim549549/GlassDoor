"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import type { DropdownOption } from "@/components/ui/SearchableDropdown";
import { logger } from "@/lib/client/logger";
import {
  EMPLOYER_REQUIRED_STATUSES,
  profileSchema,
  type ProfileFormInput,
  type ProfileFormOutput,
} from "@/lib/profile/schema";
import { BasicInfoSection } from "./edit/BasicInfoSection";
import { EducationEmploymentSection } from "./edit/EducationEmploymentSection";
import { SkillsSection } from "./edit/SkillsSection";
import { LinksSection } from "./edit/LinksSection";
import type { UserProfile } from "./types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, user, onSaveSuccess }: EditProfileModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Relational options loaded from API
  const [dbSkills, setDbSkills] = useState<DropdownOption[]>([]);
  const [dbJobTypes, setDbJobTypes] = useState<DropdownOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      handle: "",
      bio: "",
      employmentStatus: "",
      currentEmployer: "",
      seniority: "",
      education: "",
      location: "",
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
      skills: [],
      jobTypes: [],
    },
  });

  // Load initial options metadata from API
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch("/api/profile/metadata");
        if (res.ok) {
          const data = await res.json();
          setDbSkills(data.skills || []);
          setDbJobTypes(data.jobTypes || []);
        }
      } catch (err) {
        logger.error("Failed to load options metadata", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Sync form fields when the user prop changes
  useEffect(() => {
    if (user && isOpen) {
      const dbFullName =
        user.fullName ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || "");

      const skillIds = user.skills ? user.skills.map((s) => s.id) : [];

      // Only one job type is supported today.
      const jobTypeId =
        user.jobTypes && user.jobTypes.length > 0 ? user.jobTypes[0].id : undefined;

      reset({
        fullName: dbFullName,
        handle: user.handle || "",
        bio: user.bio || "",
        education: user.education || "",
        location: user.location || "",
        seniority: user.seniority || "",
        employmentStatus: user.employmentStatus || "",
        currentEmployer: user.currentEmployer || "",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        portfolioUrl: user.portfolioUrl || "",
        skills: skillIds,
        jobTypes: jobTypeId ? [jobTypeId] : [],
      });
    }
  }, [user, isOpen, reset]);

  // Drop any submit error on the way out, so a stale one from a previous
  // session isn't showing the next time the modal opens. Done here rather
  // than in the sync effect above, which would be a cascading render.
  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const watchEmploymentStatus = useWatch({ control, name: "employmentStatus" }) || "";
  const watchEducation = useWatch({ control, name: "education" }) || "";
  const watchLocation = useWatch({ control, name: "location" }) || "";
  const watchSkills = useWatch({ control, name: "skills" }) || [];
  const watchJobTypes = useWatch({ control, name: "jobTypes" }) || [];

  // Blank the employer field whenever the selected status no longer needs
  // one, mirroring the original's always-blank display for that disabled input.
  useEffect(() => {
    const showEmployer = (EMPLOYER_REQUIRED_STATUSES as readonly string[]).includes(watchEmploymentStatus);
    if (!showEmployer) {
      setValue("currentEmployer", "");
    }
  }, [watchEmploymentStatus, setValue]);

  const toggleSkill = (id: string) => {
    const next = watchSkills.includes(id) ? watchSkills.filter((item) => item !== id) : [...watchSkills, id];
    setValue("skills", next, { shouldValidate: true });
  };

  const onSubmit = async (data: ProfileFormOutput) => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      onSaveSuccess();
      handleClose();
    } catch (err) {
      logger.error("Failed to save profile", {
        error: err instanceof Error ? err.message : String(err),
      });
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[85vh] overflow-y-auto p-10 bg-background border-2 border-foreground rounded-none shadow-[6px_6px_0px_0px_var(--foreground)] font-mono text-[0.78rem] uppercase tracking-wider text-foreground z-50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="font-display text-[1.5rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-foreground">
              Edit developer credentials
            </h3>
            <p className="font-sans text-[0.65rem] text-muted-foreground leading-normal mt-1 lowercase first-letter:uppercase">
              Update your CV details, social accounts, tech skills, and employment status.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-accent text-background border border-foreground font-bold lowercase first-letter:uppercase">
              ⚠️ {errorMsg}
            </div>
          )}

          <BasicInfoSection
            register={register}
            errors={errors}
            education={watchEducation}
            location={watchLocation}
            onEducationChange={(value) => setValue("education", value, { shouldValidate: true })}
            onLocationChange={(value) => setValue("location", value, { shouldValidate: true })}
          />

          <EducationEmploymentSection
            register={register}
            errors={errors}
            employmentStatus={watchEmploymentStatus}
            dbJobTypes={dbJobTypes}
            selectedJobType={watchJobTypes[0] || ""}
            onJobTypeChange={(value) => setValue("jobTypes", value ? [value] : [], { shouldValidate: true })}
          />

          <SkillsSection
            register={register}
            errors={errors}
            dbSkills={dbSkills}
            selectedSkills={watchSkills}
            onToggleSkill={toggleSkill}
          />

          <LinksSection register={register} errors={errors} />

          {/* Hidden inputs registering the custom-controlled dropdown/multiselect
              fields with react-hook-form, mirroring the coverImageUrl pattern in
              app/contest/create/page.tsx so the zod resolver validates them. */}
          <input type="hidden" {...register("education")} />
          <input type="hidden" {...register("location")} />
          <input type="hidden" {...register("jobTypes")} />
          <input type="hidden" {...register("skills")} />

          {/* Modal Actions */}
          <div className="grid grid-cols-2 gap-5 pt-4 border-t-2 border-foreground">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full py-4 text-[0.78rem]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full py-4 text-[0.78rem]"
            >
              Save Credentials
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
