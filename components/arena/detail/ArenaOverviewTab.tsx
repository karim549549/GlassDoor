"use client";

import React from "react";
import { CheckSquare, FileText, Code2, Video, Layers, ShieldAlert, Check, Sparkles } from "lucide-react";

interface ArenaOverviewTabProps {
  description?: string;
  rulesText: string;
  requireGithubUrl: boolean;
  requireFigmaUrl: boolean;
  requireVideoUrl: boolean;
  requireWriteup: boolean;
}

export function ArenaOverviewTab({
  rulesText,
  requireGithubUrl,
  requireFigmaUrl,
  requireVideoUrl,
  requireWriteup,
}: ArenaOverviewTabProps) {
  const requirements = [
    {
      label: "GitHub Repository",
      required: requireGithubUrl,
      icon: Code2,
      tag: "CODEBASE",
      desc: "Public repository containing full working source code and setup instructions.",
    },
    {
      label: "Video Walkthrough",
      required: requireVideoUrl,
      icon: Video,
      tag: "DEMO VIDEO",
      desc: "2-3 minute video demonstration highlighting key features and execution.",
    },
    {
      label: "Project Writeup",
      required: requireWriteup,
      icon: FileText,
      tag: "DOCUMENTATION",
      desc: "Comprehensive breakdown of architecture, technical decisions, and challenges.",
    },
    {
      label: "Figma UI Specs",
      required: requireFigmaUrl,
      icon: Layers,
      tag: "DESIGN",
      desc: "Figma wireframes, user flow diagrams, or UI design component specs.",
    },
  ];

  // Parse rules into structured numbered bullet points
  const rulesList = rulesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN (2/3 Width = lg:col-span-7): REQUIRED DELIVERABLES CHECKLIST */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border-2 border-[#0E0E0D] shadow-[5px_5px_0px_0px_#0E0E0D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#0E0E0D]/10 pb-3">
            <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
              <CheckSquare className="w-4 h-4 text-orange" />
              <span>REQUIRED SUBMISSION DELIVERABLES</span>
            </div>
            <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold">
              CRITERIA CHECKLIST
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {requirements.map((req, idx) => {
              const Icon = req.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 border-2 transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    req.required
                      ? "bg-white border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      : "bg-[#0E0E0D]/5 border-[#0E0E0D]/20 opacity-60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.5rem] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-orange/10 text-orange border border-orange/30">
                        {req.tag}
                      </span>
                      <span
                        className={`font-mono text-[0.5rem] font-bold uppercase px-2 py-0.5 border ${
                          req.required
                            ? "bg-emerald-100 text-emerald-900 border-emerald-400 flex items-center gap-1"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {req.required ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                        {req.required ? "MANDATORY" : "OPTIONAL"}
                      </span>
                    </div>

                    <h4 className="font-mono text-xs font-bold uppercase text-[#0E0E0D] flex items-center gap-1.5 pt-1">
                      <Icon className="w-3.5 h-3.5 text-orange shrink-0" />
                      <span>{req.label}</span>
                    </h4>

                    <p className="font-sans text-xs text-[#0E0E0D]/70 leading-relaxed">
                      {req.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (1/3 Width = lg:col-span-5): OFFICIAL RULES & TOURNAMENT PROTOCOL */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-[#0E0E0D] text-[#F1EFE9] border-2 border-[#0E0E0D] shadow-[5px_5px_0px_0px_#FF5722] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
              <ShieldAlert className="w-4 h-4 text-orange" />
              <span>OFFICIAL RULES & PROTOCOL</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-orange" />
          </div>

          <div className="space-y-3 font-mono text-xs leading-relaxed">
            {rulesList.length > 0 ? (
              rulesList.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 border-l-4 border-orange border-y border-r border-white/10 flex items-start gap-2.5"
                >
                  <span className="font-mono text-[0.55rem] font-bold text-orange tracking-widest shrink-0 pt-0.5">
                    [{String(idx + 1).padStart(2, "0")}]
                  </span>
                  <p className="font-mono text-[0.68rem] text-[#F1EFE9]/90 leading-normal">
                    {rule.replace(/^\d+\.\s*/, "")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#F1EFE9]/60 text-xs">Standard platform rules apply to this arena.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaOverviewTab;
