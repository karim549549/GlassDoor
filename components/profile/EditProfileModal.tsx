"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface Option {
  id: string;
  name: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaveSuccess: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaveSuccess,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
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
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  // Dropdown open states (custom select dropdowns)
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [jobTypesDropdownOpen, setJobTypesDropdownOpen] = useState(false);

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
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setEducation(user.education || "");
      setSeniority(user.seniority || "");
      setEmploymentStatus(user.employmentStatus || "");
      setCurrentEmployer(user.currentEmployer || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setPortfolioUrl(user.portfolioUrl || "");

      // Sync pre-selected skills (mapping junction table objects to raw IDs)
      if (user.skills) {
        setSelectedSkills(user.skills.map((s: any) => s.skillId || s.skill?.id).filter(Boolean));
      } else {
        setSelectedSkills([]);
      }

      // Sync pre-selected job types (specialties)
      if (user.jobTypes) {
        setSelectedJobTypes(user.jobTypes.map((j: any) => j.jobTypeId || j.jobType?.id).filter(Boolean));
      } else {
        setSelectedJobTypes([]);
      }

      setErrorMsg(null);
    }
  }, [user, isOpen]);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleJobType = (id: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          handle,
          bio,
          employmentStatus,
          currentEmployer,
          seniority,
          education,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          skills: selectedSkills,
          jobTypes: selectedJobTypes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem]"
                  placeholder="e.g. Karim"
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem]"
                  placeholder="e.g. Khaled"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Arena Handle (Codename)</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="e.g. karim_99"
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Education (University)</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem]"
                  placeholder="e.g. Cairo University"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Specialties */}
          <div className="space-y-5">
            <h4 className="font-bold border-b-2 border-[#0E0E0D] pb-1 text-[#0E0E0D] text-[0.85rem]">
              2. Employment & Specialties
            </h4>
            <div className="grid grid-cols-3 gap-5">
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
              </div>
            </div>

            {/* Specialties (Job Types) Decoupled Dropdown */}
            <div className="space-y-2 relative">
              <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Specialties (Job Roles)</label>
              <div 
                onClick={() => setJobTypesDropdownOpen(!jobTypesDropdownOpen)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] min-h-[42px] flex flex-wrap gap-2 items-center cursor-pointer select-none"
              >
                {selectedJobTypes.length === 0 ? (
                  <span className="text-muted-foreground/65">Click to select specialties</span>
                ) : (
                  selectedJobTypes.map((id) => {
                    const jtName = dbJobTypes.find(j => j.id === id)?.name || id;
                    return (
                      <span key={id} className="px-2.5 py-1 bg-[#0E0E0D] text-[#F1EFE9] flex items-center gap-1.5 hover:bg-orange transition-colors">
                        {jtName}
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); toggleJobType(id); }}
                          className="font-black text-[0.7rem] ml-1 hover:text-accent focus:outline-none bg-transparent border-none p-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {jobTypesDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#F1EFE9] border border-[#0E0E0D] z-50 max-h-48 overflow-y-auto divide-y divide-[#0E0E0D]/10 shadow-lg">
                  {dbJobTypes.map((jt) => {
                    const selected = selectedJobTypes.includes(jt.id);
                    return (
                      <div 
                        key={jt.id}
                        onClick={() => toggleJobType(jt.id)}
                        className={`p-3.5 cursor-pointer flex items-center justify-between transition-colors ${
                          selected ? "bg-orange/15 font-bold text-orange hover:bg-orange/20" : "hover:bg-[#0E0E0D]/5"
                        }`}
                      >
                        <span>{jt.name}</span>
                        {selected && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
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
                className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase first-letter:uppercase text-[0.78rem] normal-case"
                placeholder="Brief summary of your development experience..."
              />
            </div>

            {/* Skills Multi-Select Dropdown */}
            <div className="space-y-2 relative">
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
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">Portfolio Website URL</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none lowercase text-[0.78rem]"
                  placeholder="https://portfolio.dev"
                />
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
