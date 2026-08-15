"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DropdownOption } from "@/components/ui/SearchableDropdown";
import type { ProfileFormInput } from "@/lib/profile/schema";

interface SkillsSectionProps {
  register: UseFormRegister<ProfileFormInput>;
  errors: FieldErrors<ProfileFormInput>;
  dbSkills: DropdownOption[];
  selectedSkills: string[];
  onToggleSkill: (id: string) => void;
}

export function SkillsSection({ register, errors, dbSkills, selectedSkills, onToggleSkill }: SkillsSectionProps) {
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const skillsContainerRef = useRef<HTMLDivElement>(null);

  // Click outside listener for the custom skills dropdown.
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

  return (
    <div className="space-y-5">
      <h4 className="font-bold border-b-2 border-foreground pb-1 text-foreground text-[0.85rem]">
        3. About & Tech Skills
      </h4>
      <div className="space-y-2">
        <label htmlFor="bio" className="font-bold text-[0.72rem] tracking-widest text-muted-foreground">
          Bio (About Statement)
        </label>
        <textarea
          id="bio"
          rows={3}
          className="w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none text-[0.78rem] normal-case"
          placeholder="Brief summary of your development experience..."
          {...register("bio")}
        />
        {errors.bio && (
          <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none">
            ⚠️ {errors.bio.message}
          </span>
        )}
      </div>

      {/* Skills Multi-Select Dropdown */}
      <div ref={skillsContainerRef} className="space-y-2 relative">
        <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground" id="skills-label">
          Tech Skills Dropdown
        </label>
        <div
          onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
          role="button"
          tabIndex={0}
          aria-labelledby="skills-label"
          className="w-full p-3 bg-card border border-foreground min-h-[42px] flex flex-wrap gap-2 items-center cursor-pointer select-none"
        >
          {selectedSkills.length === 0 ? (
            <span className="text-muted-foreground/65">Click to select skills</span>
          ) : (
            selectedSkills.map((id) => {
              const skillName = dbSkills.find((s) => s.id === id)?.name || id;
              return (
                <span
                  key={id}
                  className="px-2.5 py-1 bg-orange text-card flex items-center gap-1.5 hover:bg-foreground transition-colors"
                >
                  {skillName}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSkill(id);
                    }}
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
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-background border border-foreground z-50 max-h-48 overflow-y-auto divide-y divide-foreground/10 shadow-lg">
            {dbSkills.map((skill) => {
              const selected = selectedSkills.includes(skill.id);
              return (
                <div
                  key={skill.id}
                  onClick={() => onToggleSkill(skill.id)}
                  className={`p-3.5 cursor-pointer flex items-center justify-between transition-colors ${
                    selected ? "bg-orange/15 font-bold text-orange hover:bg-orange/20" : "hover:bg-foreground/5"
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
  );
}
