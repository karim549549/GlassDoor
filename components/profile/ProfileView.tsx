"use client";

import React, { useState } from "react";
import { Edit2, ExternalLink } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileViewProps {
  userProfile: any;
  isOwner: boolean;
}

export function ProfileView({ userProfile, isOwner }: ProfileViewProps) {
  const [profile, setProfile] = useState(userProfile);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleSaveSuccess = async () => {
    // Force clean refetch from server by reloading
    window.location.reload();
  };

  // Pre-formatted skills
  const skillsList = profile.skills?.map((s: any) => s.skill?.name).filter(Boolean) || [];
  // Pre-formatted job types (specialties)
  const specialties = profile.jobTypes?.map((j: any) => j.jobType?.name).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[#F1EFE9] text-[#0E0E0D] pb-16">
      {/* Cover and header ribbon banner */}
      <ProfileHeader 
        userProfile={profile} 
        isOwner={isOwner} 
        onEditClick={() => setEditModalOpen(true)}
        onUpdateSuccess={(type, url) => {
          setProfile((prev: any) => ({ ...prev, [type === "avatar" ? "avatarUrl" : "coverUrl"]: url }));
        }}
      />

      {/* Main Stacked Feed Container (max-w-[1500px] matching header padding) */}
      <div className="max-w-[1500px] mx-auto mt-8 px-8 md:px-12 space-y-6">
        
        {/* Top Row: Left Profile Info (2/3) & Right Arena Stats (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Developer Profile Card (2/3 width) */}
          <div className="md:col-span-2 border border-[#0E0E0D] bg-[#FAF8F5] p-6 font-mono text-[0.65rem] uppercase tracking-wider relative shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] flex flex-col justify-between">
            {/* Edit Button */}
            {isOwner && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="absolute top-4 right-4 p-1.5 bg-[#F1EFE9] border border-[#0E0E0D] hover:bg-orange hover:text-[#FAF8F5] transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}

            <div className="space-y-4">
              <div className="border-b border-[#0E0E0D]/10 pb-2">
                <h3 className="font-bold text-[0.8rem] text-[#0E0E0D]">Developer Profile</h3>
              </div>

              {/* Bio Statement */}
              <div className="space-y-1.5 lowercase first-letter:uppercase text-[0.7rem] normal-case leading-relaxed text-[#0E0E0D]/85">
                <span className="font-bold font-mono text-[0.65rem] uppercase tracking-widest text-[#0E0E0D] block mb-1">About Bio:</span>
                {profile.bio || "No biography added yet. Click edit to write a brief summary of your development experience."}
              </div>

              <div className="border-t border-[#0E0E0D]/10 pt-3 space-y-2">
                <span className="font-bold block text-[#0E0E0D] mb-1">Tech Skills:</span>
                {skillsList.length === 0 ? (
                  <span className="text-muted-foreground/60 lowercase normal-case italic">No skills selected yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skillName: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-orange text-[#FAF8F5] border border-orange font-bold text-[0.55rem] tracking-wider"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#0E0E0D]/10 pt-3 space-y-2.5">
                <span className="font-bold block text-[#0E0E0D]">Credentials & Employment:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground font-mono">
                  <div className="flex justify-between border-b border-[#0E0E0D]/5 pb-1">
                    <span>Specialties</span>
                    <span className="font-bold text-[#0E0E0D] text-right max-w-[65%] truncate">
                      {specialties.join(", ") || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#0E0E0D]/5 pb-1">
                    <span>Seniority</span>
                    <span className="font-bold text-[#0E0E0D]">{profile.seniority || "None"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#0E0E0D]/5 pb-1">
                    <span>Status</span>
                    <span className="font-bold text-[#0E0E0D]">{profile.employmentStatus || "None"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#0E0E0D]/5 pb-1">
                    <span>Employer</span>
                    <span className="font-bold text-[#0E0E0D]">{profile.currentEmployer || "None"}</span>
                  </div>
                  <div className="flex justify-between sm:col-span-2 border-b border-[#0E0E0D]/5 pb-1">
                    <span>Education</span>
                    <span className="font-bold text-[#0E0E0D]">{profile.education || "None"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arena Stats Summary Card (1/3 width, spans h-full) */}
          <div className="border border-[#0E0E0D] bg-[#FAF8F5] p-6 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] flex flex-col justify-between gap-4">
            <div className="border-b border-[#0E0E0D]/10 pb-2">
              <h3 className="font-bold text-[0.8rem] text-[#0E0E0D]">Arena Stats</h3>
            </div>

            {/* distributed metrics as vertical brutalist blocks */}
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div className="p-3 bg-[#0E0E0D] text-[#F1EFE9] flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
                <span className="text-[#F1EFE9]/50 text-[0.52rem] tracking-widest font-black">CURRENT RATING</span>
                <span className="text-[1.1rem] font-bold text-orange mt-1">{profile.rating || 0}</span>
              </div>

              <div className="p-3 border border-[#0E0E0D] bg-[#FAF8F5] flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
                <span className="text-[#0E0E0D]/50 text-[0.52rem] tracking-widest font-black">MAX RATING</span>
                <span className="text-[1.1rem] font-bold text-[#0E0E0D] mt-1">{profile.rating ? profile.rating + 140 : 0}</span>
              </div>

              <div className="p-3 border border-[#0E0E0D] bg-[#FAF8F5] flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
                <span className="text-[#0E0E0D]/50 text-[0.52rem] tracking-widest font-black">ARENA RANK</span>
                <span className="text-[0.7rem] font-bold text-[#0E0E0D] mt-1">TOP 12% EGYPT</span>
              </div>

              <div className="p-3 border border-[#0E0E0D] bg-[#FAF8F5] flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
                <span className="text-[#0E0E0D]/50 text-[0.52rem] tracking-widest font-black">PROBLEMS COMPLETED</span>
                <span className="text-[1.1rem] font-bold text-[#0E0E0D] mt-1">195</span>
              </div>

              <div className="p-3 border border-[#0E0E0D] bg-[#FAF8F5] flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
                <span className="text-[#0E0E0D]/50 text-[0.52rem] tracking-widest font-black">ACTIVE STREAK</span>
                <span className="text-[0.7rem] font-bold text-[#0E0E0D] mt-1">14 DAYS MAX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Full-width Arena Performance Record Card */}
        <div className="border border-[#0E0E0D] bg-[#FAF8F5] p-6 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] space-y-6">
          <div className="border-b border-[#0E0E0D]/10 pb-2">
            <h3 className="font-bold text-[0.8rem] text-[#0E0E0D]">Arena Performance Record</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SVG Rating Trend line chart */}
            <div className="space-y-2">
              <span className="font-bold text-[#0E0E0D] block">Rating Trend (Contest History):</span>
              <div className="w-full h-40 border border-[#0E0E0D]/25 bg-[#F1EFE9]/40 relative overflow-hidden flex items-center justify-center">
                {/* Brutalist Grid Paper Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                {/* SVG Sparkline */}
                <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M 5,90 L 25,60 L 45,75 L 65,40 L 85,45 L 95,30" 
                    fill="none" 
                    stroke="#0E0E0D" 
                    strokeWidth="1.5" 
                  />
                  <path 
                    d="M 5,90 L 25,60 L 45,75 L 65,40 L 85,45 L 95,30 L 95,100 L 5,100 Z" 
                    fill="url(#orange-gradient)" 
                    opacity="0.1" 
                  />
                  
                  {/* Dots */}
                  <circle cx="5" cy="90" r="1.5" fill="#0E0E0D" />
                  <circle cx="25" cy="60" r="1.5" fill="#0E0E0D" />
                  <circle cx="45" cy="75" r="1.5" fill="#0E0E0D" />
                  <circle cx="65" cy="40" r="1.5" fill="#0E0E0D" />
                  <circle cx="85" cy="45" r="1.5" fill="#0E0E0D" />
                  <circle cx="95" cy="30" r="2" fill="orange" stroke="#0E0E0D" strokeWidth="0.5" />
                  
                  <defs>
                    <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="orange" />
                      <stop offset="100%" stopColor="orange" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Legend labels */}
                <span className="absolute top-2 left-2 text-[0.45rem] font-bold text-muted-foreground">MAX rating: 1680</span>
                <span className="absolute bottom-2 right-2 text-[0.45rem] font-bold text-muted-foreground">C1  C2  C3  C4  C5  C6</span>
              </div>
            </div>

            {/* Solve activity calendar heatmap */}
            <div className="space-y-2">
              <span className="font-bold text-[#0E0E0D] block">Solve Activity Heatmap:</span>
              <div className="w-full h-40 border border-[#0E0E0D]/25 bg-[#F1EFE9]/40 p-4 flex flex-col justify-between relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px)] bg-[size:12px_1px]" />
                
                <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">MON</span>
                    <div className="flex gap-1">
                      {"█░░▒▓██░░▒▓██░░▒▓█".split("").map((char, i) => (
                        <span key={i} className={`w-3.5 h-3.5 border border-[#0E0E0D]/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                          char === "█" ? "bg-orange text-[#FAF8F5]" : char === "▓" ? "bg-orange/60 text-[#FAF8F5]" : char === "▒" ? "bg-orange/30 text-[#0E0E0D]" : "bg-[#F1EFE9] text-[#0E0E0D]/30"
                        }`}>{char}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">WED</span>
                    <div className="flex gap-1">
                      {"░▒▓██░░▒▓██░░▒▓██░".split("").map((char, i) => (
                        <span key={i} className={`w-3.5 h-3.5 border border-[#0E0E0D]/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                          char === "█" ? "bg-orange text-[#FAF8F5]" : char === "▓" ? "bg-orange/60 text-[#FAF8F5]" : char === "▒" ? "bg-orange/30 text-[#0E0E0D]" : "bg-[#F1EFE9] text-[#0E0E0D]/30"
                        }`}>{char}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">FRI</span>
                    <div className="flex gap-1">
                      {"▒▓██░░▒▓██░░▒▓██░░".split("").map((char, i) => (
                        <span key={i} className={`w-3.5 h-3.5 border border-[#0E0E0D]/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                          char === "█" ? "bg-orange text-[#FAF8F5]" : char === "▓" ? "bg-orange/60 text-[#FAF8F5]" : char === "▒" ? "bg-orange/30 text-[#0E0E0D]" : "bg-[#F1EFE9] text-[#0E0E0D]/30"
                        }`}>{char}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[0.45rem] text-muted-foreground flex justify-between items-center pt-2 border-t border-[#0E0E0D]/10">
                  <span>Intensity: [ ] Low ➔ [█] High</span>
                  <span>Solves last 3 months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Contests results table */}
          <div className="space-y-3.5 border-t border-[#0E0E0D]/10 pt-4">
            <span className="font-bold text-[#0E0E0D] block">Latest results:</span>
            <div className="overflow-x-auto border border-[#0E0E0D]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0E0E0D] text-[#F1EFE9] text-[0.58rem] tracking-widest font-black uppercase">
                    <th className="p-3 border-r border-[#FAF8F5]/10">Context</th>
                    <th className="p-3 border-r border-[#FAF8F5]/10 text-center">Rank</th>
                    <th className="p-3 border-r border-[#FAF8F5]/10 text-center">Points</th>
                    <th className="p-3 text-center">Rating Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E0E0D] bg-[#FAF8F5] text-[0.58rem]">
                  <tr className="hover:bg-[#0E0E0D]/5 transition-colors">
                    <td className="p-3 border-r border-[#0E0E0D] font-bold text-[#0E0E0D]">Cairo Web Arena #3</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center font-bold">21/200</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center">450 PTS</td>
                    <td className="p-3 text-center font-bold text-green-600">+85 (Expert)</td>
                  </tr>
                  <tr className="hover:bg-[#0E0E0D]/5 transition-colors">
                    <td className="p-3 border-r border-[#0E0E0D] font-bold text-[#0E0E0D]">Alex-JS Tournament</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center font-bold">45/120</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center">300 PTS</td>
                    <td className="p-3 text-center font-bold text-accent">-12 (Expert)</td>
                  </tr>
                  <tr className="hover:bg-[#0E0E0D]/5 transition-colors">
                    <td className="p-3 border-r border-[#0E0E0D] font-bold text-[#0E0E0D]">Delta Hackathon</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center font-bold">5/150</td>
                    <td className="p-3 border-r border-[#0E0E0D] text-center">900 PTS</td>
                    <td className="p-3 text-center font-bold text-green-600">+210 (Specialist)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={profile}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
