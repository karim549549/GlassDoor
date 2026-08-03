"use client";

import React, { useState } from "react";
import { Upload, CheckCircle2, Code2, Video, Layers, FileText } from "lucide-react";

interface ArenaSubmissionTabProps {
  requireGithubUrl: boolean;
  requireFigmaUrl: boolean;
  requireVideoUrl: boolean;
  requireWriteup: boolean;
  isRegistered: boolean;
}

export function ArenaSubmissionTab({
  requireGithubUrl,
  requireFigmaUrl,
  requireVideoUrl,
  requireWriteup,
  isRegistered,
}: ArenaSubmissionTabProps) {
  const [githubUrl, setGithubUrl] = useState("https://github.com/example/my-arena-entry");
  const [videoUrl, setVideoUrl] = useState("https://youtube.com/watch?v=demo");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [writeup, setWriteup] = useState("Built with Next.js, Tailwind, and Prisma...");

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!isRegistered) {
    return (
      <div className="p-8 bg-white border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 border border-amber-400 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-mono text-base font-bold uppercase tracking-wider text-[#0E0E0D]">
          SUBMISSION PORTAL LOCKED
        </h3>
        <p className="font-mono text-xs text-[#0E0E0D]/60 max-w-md mx-auto">
          You must be a registered participant in this arena to submit project links and writeups.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-emerald-600 font-bold">
            <Upload className="w-4 h-4" />
            <span>PROJECT SUBMISSION PORTAL</span>
          </div>
          <p className="font-mono text-[0.52rem] text-[#0E0E0D]/60 uppercase tracking-widest mt-0.5">
            Submit or update your project links before the implementation deadline.
          </p>
        </div>

        {submitted && (
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            [✓] SUBMISSION SAVED
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* GitHub URL */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold tracking-wider text-[#0E0E0D]">
            <Code2 className="w-4 h-4 text-orange" />
            <span>GITHUB REPOSITORY URL {requireGithubUrl && <span className="text-red-500">*</span>}</span>
          </label>
          <input
            type="url"
            required={requireGithubUrl}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full px-3.5 py-2.5 border-2 border-[#0E0E0D] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* Video URL */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold tracking-wider text-[#0E0E0D]">
            <Video className="w-4 h-4 text-orange" />
            <span>VIDEO DEMO URL {requireVideoUrl && <span className="text-red-500">*</span>}</span>
          </label>
          <input
            type="url"
            required={requireVideoUrl}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3.5 py-2.5 border-2 border-[#0E0E0D] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* Figma URL */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold tracking-wider text-[#0E0E0D]">
            <Layers className="w-4 h-4 text-orange" />
            <span>FIGMA PROTOTYPE URL {requireFigmaUrl && <span className="text-red-500">*</span>}</span>
          </label>
          <input
            type="url"
            required={requireFigmaUrl}
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="https://figma.com/file/..."
            className="w-full px-3.5 py-2.5 border-2 border-[#0E0E0D] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* Writeup */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold tracking-wider text-[#0E0E0D]">
            <FileText className="w-4 h-4 text-orange" />
            <span>PROJECT WRITEUP & SUMMARY {requireWriteup && <span className="text-red-500">*</span>}</span>
          </label>
          <textarea
            rows={4}
            required={requireWriteup}
            value={writeup}
            onChange={(e) => setWriteup(e.target.value)}
            placeholder="Explain your approach, technology stack, features, and key challenges solved..."
            className="w-full px-3.5 py-2.5 border-2 border-[#0E0E0D] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="py-3 px-6 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-xs uppercase tracking-[0.2em] font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#10B981] transition-all"
          >
            {submitted ? "UPDATE SUBMISSION" : "SUBMIT ENTRY"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArenaSubmissionTab;
