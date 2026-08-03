"use client";

import React from "react";
import { CheckSquare, FileText, Code2, Video, Layers, ShieldAlert } from "lucide-react";

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
      label: "GitHub Source Code Repository",
      required: requireGithubUrl,
      icon: Code2,
      desc: "Link to your public repository containing project source code.",
    },
    {
      label: "Video Demo / Presentation",
      required: requireVideoUrl,
      icon: Video,
      desc: "2-3 minute YouTube or Loom walkthrough of your build.",
    },
    {
      label: "Project Writeup & Documentation",
      required: requireWriteup,
      icon: FileText,
      desc: "Detailed explanation of architecture, setup, and submission story.",
    },
    {
      label: "Figma / UI Design Specs",
      required: requireFigmaUrl,
      icon: Layers,
      desc: "Link to Figma file or prototype wireframe assets.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Submission Requirements Checklist */}
      <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6 space-y-4">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold border-b border-[#0E0E0D]/10 pb-3">
          <CheckSquare className="w-4 h-4" />
          <span>REQUIRED SUBMISSION DELIVERABLES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requirements.map((req, idx) => {
            const Icon = req.icon;
            return (
              <div
                key={idx}
                className={`p-4 border-2 transition-all ${
                  req.required
                    ? "bg-[#0E0E0D]/5 border-[#0E0E0D]"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E0D]">
                      {req.label}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[0.52rem] font-bold uppercase px-2 py-0.5 border ${
                      req.required
                        ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {req.required ? "[✓] MANDATORY" : "[ ] OPTIONAL"}
                  </span>
                </div>
                <p className="font-mono text-[0.55rem] text-[#0E0E0D]/60 uppercase tracking-wide">
                  {req.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Rules Section */}
      <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6 space-y-4">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold border-b border-[#0E0E0D]/10 pb-3">
          <ShieldAlert className="w-4 h-4" />
          <span>OFFICIAL RULES & GUIDELINES</span>
        </div>

        <div className="p-4 bg-[#0E0E0D] text-[#F1EFE9] font-mono text-xs leading-relaxed border border-[#0E0E0D] whitespace-pre-line overflow-x-auto">
          {rulesText || "No custom rules specified for this arena. Standard platform rules apply."}
        </div>
      </div>
    </div>
  );
}

export default ArenaOverviewTab;
