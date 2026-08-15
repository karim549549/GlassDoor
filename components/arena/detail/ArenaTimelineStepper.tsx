"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar } from "lucide-react";

export interface ArenaPhaseStep {
  key: "registration" | "idea" | "implementation" | "completed";
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

interface ArenaTimelineStepperProps {
  status: string;
  registrationStart: string;
  registrationEnd: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  implPhaseStart: string;
  implPhaseEnd: string;
}

export function ArenaTimelineStepper({
  status,
  registrationStart,
  registrationEnd,
  ideaPhaseStart,
  ideaPhaseEnd,
  implPhaseStart,
  implPhaseEnd,
}: ArenaTimelineStepperProps) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const isCompleted = status === "COMPLETED";
  const isImpl = status === "IMPLEMENTATION_PHASE";
  const isIdea = status === "IDEA_PHASE" || status === "IDEA_REVIEW";
  const isReg = status === "REGISTRATION_OPEN" || status === "DRAFT";

  const steps: ArenaPhaseStep[] = [
    {
      key: "registration",
      label: "1. REGISTRATION",
      startDate: formatDate(registrationStart),
      endDate: formatDate(registrationEnd),
      isCurrent: isReg,
      isCompleted: isIdea || isImpl || isCompleted,
    },
    {
      key: "idea",
      label: "2. IDEA PHASE",
      startDate: formatDate(ideaPhaseStart),
      endDate: formatDate(ideaPhaseEnd),
      isCurrent: isIdea,
      isCompleted: isImpl || isCompleted,
    },
    {
      key: "implementation",
      label: "3. BUILD & SUBMIT",
      startDate: formatDate(implPhaseStart),
      endDate: formatDate(implPhaseEnd),
      isCurrent: isImpl,
      isCompleted: isCompleted,
    },
    {
      key: "completed",
      label: "4. RESULTS & WINNERS",
      startDate: formatDate(implPhaseEnd),
      endDate: "FINAL",
      isCurrent: isCompleted,
      isCompleted: false,
    },
  ];

  return (
    <div className="w-full bg-foreground text-background border-y-2 border-foreground py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-orange font-bold shrink-0 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>ARENA TIMELINE & PHASES</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`p-2.5 border transition-all duration-200 ${
                step.isCurrent
                  ? "bg-background text-foreground border-orange shadow-[3px_3px_0px_0px_#FF5722]"
                  : step.isCompleted
                  ? "bg-white/5 border-emerald-500/40 text-emerald-400"
                  : "bg-white/5 border-white/10 text-background/50"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider">
                  {step.label}
                </span>
                {step.isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {step.isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
                )}
              </div>
              <div className="font-mono text-[0.5rem] tracking-tight opacity-80 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {step.startDate} – {step.endDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArenaTimelineStepper;
