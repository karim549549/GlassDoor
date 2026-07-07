"use client";

import React, { useState, useEffect, useRef } from "react";
import * as yup from "yup";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import type { UserProfile } from "./types";

interface Option {
  id: string;
  name: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveSuccess: () => void;
}

const EGYPTIAN_UNIVERSITIES = [
  "Cairo University",
  "Ain Shams University",
  "Alexandria University",
  "Mansoura University",
  "Helwan University",
  "Zagazig University",
  "Tanta University",
  "Assiut University",
  "Suez Canal University",
  "Minia University",
  "Monufia University",
  "Banha University",
  "Fayoum University",
  "Sohag University",
  "Beni-Suef University",
  "Aswan University",
  "Damietta University",
  "Port Said University",
  "Kafr El-Sheikh University",
  "Damanhour University",
  "Suez University",
  "Sadat City University",
  "Arish University",
  "Luxor University",
  "New Valley University",
  "Matrouh University",
  "American University in Cairo (AUC)",
  "German University in Cairo (GUC)",
  "British University in Egypt (BUE)",
  "Future University in Egypt (FUE)",
  "Heliopolis University",
  "Misr University for Science and Technology (MUST)",
  "October 6 University (O6U)",
  "Nile University",
  "Modern Sciences and Arts University (MSA)",
  "Arab Academy for Science, Technology and Maritime Transport (AASTMT)",
  "Egyptian Russian University (ERU)",
  "Pharos University in Alexandria (PUA)",
  "El Gouna Technical University",
  "Galala University",
  "King Salman International University (KSIU)",
  "New Alamein City University",
  "E-Just (Egypt-Japan University of Science and Technology)"
];

const EGYPT_LOCATIONS = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Gharbia",
  "Monufia",
  "Sharqia",
  "Beheira",
  "Damietta",
  "Matrouh",
  "Suez",
  "Ismailia",
  "Port Said",
  "North Sinai",
  "South Sinai",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Kafr El-Sheikh"
];

// validation schema
const profileSchema = yup.object().shape({
  fullName: yup.string().trim().required("Full name is required").min(2, "Full name must be at least 2 characters"),
  handle: yup.string().trim().nullable(),
  bio: yup.string().trim().nullable(),
  employmentStatus: yup.string().required("Employment status is required"),
  currentEmployer: yup.string().when("employmentStatus", {
    is: (val: string) => ["EMPLOYED", "FREELANCER", "INTERN"].includes(val),
    then: (schema) => schema.required("Employer is required"),
    otherwise: (schema) => schema.strip(),
  }),
  seniority: yup.string().required("Seniority level is required"),
  education: yup.string().required("Education (University) is required").oneOf(EGYPTIAN_UNIVERSITIES, "Please select a valid Egyptian university"),
  location: yup.string().required("Location is required").oneOf(EGYPT_LOCATIONS, "Please select a valid location"),
  githubUrl: yup.string().url("Must be a valid URL starting with http:// or https://").nullable(),
  linkedinUrl: yup.string().url("Must be a valid URL starting with http:// or https://").nullable(),
  portfolioUrl: yup.string().url("Must be a valid URL starting with http:// or https://").nullable(),
  selectedJobType: yup.string().required("Current job title is required"),
});

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaveSuccess,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [currentEmployer, setCurrentEmployer] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Relational options loaded from API
  const [dbSkills, setDbSkills] = useState<Option[]>([]);
  const [dbJobTypes, setDbJobTypes] = useState<Option[]>([]);

  // Selected Option IDs
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState("");

  // Dropdown open state for skills multi-select
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const skillsContainerRef = useRef<HTMLDivElement>(null);

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
        console.error("Failed to load options metadata:", err);
      }
    }
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Sync form inputs when user prop changes
  useEffect(() => {
    if (user && isOpen) {
      const dbFullName = user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || "");
      setFullName(dbFullName);
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setEducation(user.education || "");
      setLocation(user.location || "");
      setSeniority(user.seniority || "");
      setEmploymentStatus(user.employmentStatus || "");
      setCurrentEmployer(user.currentEmployer || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setPortfolioUrl(user.portfolioUrl || "");

      // Sync pre-selected skills
      if (user.skills) {
        setSelectedSkills(
          user.skills.map((s) => s.skillId || s.skill?.id).filter((id): id is string => Boolean(id))
        );
      } else {
        setSelectedSkills([]);
      }

      // Sync pre-selected job types (only one supported now)
      if (user.jobTypes && user.jobTypes.length > 0) {
        const firstJobType = user.jobTypes[0];
        setSelectedJobType(firstJobType.jobTypeId || firstJobType.jobType?.id || "");
      } else {
        setSelectedJobType("");
      }

      setErrors({});
      setErrorMsg(null);
    }
  }, [user, isOpen]);

  // Click outside listener for custom skills dropdown
  useEffect(() => {
    function handleClickOutsideSkills(event: MouseEvent) {
      if (skillsContainerRef.current && !skillsContainerRef.current.contains(event.target as Node)) {
        setSkillsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSkills);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSkills);
    };
  }, []);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setErrors({});

    const showEmployer =
      employmentStatus === "EMPLOYED" ||
      employmentStatus === "FREELANCER" ||
      employmentStatus === "INTERN";

    const cleanedGithub = githubUrl.trim() === "" ? null : githubUrl.trim();
    const cleanedLinkedin = linkedinUrl.trim() === "" ? null : linkedinUrl.trim();
    const cleanedPortfolio = portfolioUrl.trim() === "" ? null : portfolioUrl.trim();

    const formData = {
      fullName,
      handle: handle || null,
      bio: bio || null,
      employmentStatus,
      currentEmployer: showEmployer ? currentEmployer : "",
      seniority,
      education,
      location,
      githubUrl: cleanedGithub,
      linkedinUrl: cleanedLinkedin,
      portfolioUrl: cleanedPortfolio,
      selectedJobType,
    };

    try {
      await profileSchema.validate(formData, { abortEarly: false });

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          handle,
          bio,
          employmentStatus,
          currentEmployer: showEmployer ? currentEmployer : "",
          seniority,
          education,
          location,
          githubUrl: cleanedGithub,
          linkedinUrl: cleanedLinkedin,
          portfolioUrl: cleanedPortfolio,
          skills: selectedSkills,
          jobTypes: selectedJobType ? [selectedJobType] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((validationError: any) => {
          if (validationError.path) {
            newErrors[validationError.path] = validationError.message;
          }
        });
        setErrors(newErrors);
        setErrorMsg("Please correct the form validation errors.");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showEmployerField =
    employmentStatus === "EMPLOYED" ||
    employmentStatus === "FREELANCER" ||
    employmentStatus === "INTERN";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[85vh] overflow-y-auto p-10 bg-[#F1EFE9] border-2 border-[#0E0E0D] rounded-none shadow-[6px_6px_0px_0px_#0E0E0D] font-mono text-[0.78rem] uppercase tracking-wider text-[#0E0E0D] z-50">
        <form onSubmit={handleSave} className="space-y-8">
          <div>
            <h3 className="font-display text-[1.5rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-[#0E0E0D]">
              Edit developer credentials
            </h3>
            <p className="font-sans text-[0.65rem] text-muted-foreground leading-normal mt-1 lowercase first-letter:uppercase">
              Update your CV details, social accounts, tech skills, and employment status.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-accent text-[#F1EFE9] border border-[#0E0E0D] font-bold lowercase first-letter:uppercase">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Section 1: Personal Credentials */}
          <div className="space-y-5">
            <h4 className="font-bold border-b-2 border-[#0E0E0D] pb-1 text-[#0E0E0D] text-[0.85rem]">
              1. Personal Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem]"
                  placeholder="e.g. Karim Khaled"
                />
                {errors.fullName && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.fullName}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Arena Handle (Codename)</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="e.g. karim_99"
                />
                {errors.handle && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.handle}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SearchableDropdown
                label="Education (Egyptian University)"
                options={EGYPTIAN_UNIVERSITIES}
                value={education}
                onChange={setEducation}
                placeholder="Search Egyptian University..."
                error={errors.education}
              />
              <SearchableDropdown
                label="Location (Egypt Governorate)"
                options={EGYPT_LOCATIONS}
                value={location}
                onChange={setLocation}
                placeholder="Search Egypt Governorate..."
                error={errors.location}
              />
            </div>
          </div>

          {/* Section 2: Employment & Specialties */}
          <div className="space-y-5">
            <h4 className="font-bold border-b-2 border-[#0E0E0D] pb-1 text-[#0E0E0D] text-[0.85rem]">
              2. Employment & Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Seniority Level</label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none rounded-none text-[0.78rem] uppercase cursor-pointer"
                >
                  <option value="">Select Seniority</option>
                  <option value="JUNIOR">Junior Developer</option>
                  <option value="MID">Mid-level Developer</option>
                  <option value="SENIOR">Senior Developer</option>
                  <option value="LEAD">Lead Engineer</option>
                  <option value="MANAGER">Engineering Manager</option>
                </select>
                {errors.seniority && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.seniority}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none rounded-none text-[0.78rem] uppercase cursor-pointer"
                >
                  <option value="">Select Status</option>
                  <option value="UNEMPLOYED">Looking For Work</option>
                  <option value="EMPLOYED">Employed Full-Time</option>
                  <option value="FREELANCER">Freelancing</option>
                  <option value="INTERN">Internship</option>
                  <option value="STUDENT">Student</option>
                </select>
                {errors.employmentStatus && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.employmentStatus}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Current Employer</label>
                <input
                  type="text"
                  disabled={!showEmployerField}
                  value={showEmployerField ? currentEmployer : ""}
                  onChange={(e) => setCurrentEmployer(e.target.value)}
                  className={`w-full p-3 border border-[#0E0E0D] focus:outline-none rounded-none uppercase text-[0.78rem] ${
                    showEmployerField ? "bg-[#FAF8F5]" : "bg-gray-200 cursor-not-allowed opacity-50"
                  }`}
                  placeholder={showEmployerField ? "e.g. Google" : "Not Employed"}
                />
                {errors.currentEmployer && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.currentEmployer}
                  </span>
                )}
              </div>
            </div>

            <div>
              <SearchableDropdown
                label="Current Job Title"
                options={dbJobTypes}
                value={selectedJobType}
                onChange={setSelectedJobType}
                placeholder="Search Current Job Title..."
                error={errors.selectedJobType}
              />
            </div>
          </div>

          {/* Section 3: About Bio & Tech Skills */}
          <div className="space-y-5">
            <h4 className="font-bold border-b-2 border-[#0E0E0D] pb-1 text-[#0E0E0D] text-[0.85rem]">
              3. About & Tech Skills
            </h4>
            <div className="space-y-2">
              <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Bio (About Statement)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none text-[0.78rem] normal-case"
                placeholder="Brief summary of your development experience..."
              />
            </div>

            {/* Skills Multi-Select Dropdown */}
            <div ref={skillsContainerRef} className="space-y-2 relative">
              <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Tech Skills Dropdown</label>
              <div 
                onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] min-h-[42px] flex flex-wrap gap-2 items-center cursor-pointer select-none"
              >
                {selectedSkills.length === 0 ? (
                  <span className="text-muted-foreground/65">Click to select skills</span>
                ) : (
                  selectedSkills.map((id) => {
                    const skillName = dbSkills.find(s => s.id === id)?.name || id;
                    return (
                      <span key={id} className="px-2.5 py-1 bg-orange text-[#FAF8F5] flex items-center gap-1.5 hover:bg-[#0E0E0D] transition-colors">
                        {skillName}
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); toggleSkill(id); }}
                          className="font-black text-[0.7rem] ml-1 hover:text-accent focus:outline-none bg-transparent border-none p-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {skillsDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#F1EFE9] border border-[#0E0E0D] z-50 max-h-48 overflow-y-auto divide-y divide-[#0E0E0D]/10 shadow-lg">
                  {dbSkills.map((skill) => {
                    const selected = selectedSkills.includes(skill.id);
                    return (
                      <div 
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`p-3.5 cursor-pointer flex items-center justify-between transition-colors ${
                          selected ? "bg-orange/15 font-bold text-orange hover:bg-orange/20" : "hover:bg-[#0E0E0D]/5"
                        }`}
                      >
                        <span>{skill.name}</span>
                        {selected && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Social Accounts */}
          <div className="space-y-5">
            <h4 className="font-bold border-b-2 border-[#0E0E0D] pb-1 text-[#0E0E0D] text-[0.85rem]">
              4. Social Links (URLs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">GitHub Profile URL</label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://github.com/..."
                />
                {errors.githubUrl && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.githubUrl}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://linkedin.com/in/..."
                />
                {errors.linkedinUrl && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.linkedinUrl}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Portfolio Website URL</label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://portfolio.dev"
                />
                {errors.portfolioUrl && (
                  <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
                    ⚠️ {errors.portfolioUrl}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="grid grid-cols-2 gap-5 pt-4 border-t-2 border-[#0E0E0D]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-4 text-[0.78rem]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
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
