"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { SalaryModalJobDetailsSection } from "./SalaryModalJobDetailsSection";
import { SalaryModalCompensationSection } from "./SalaryModalCompensationSection";
import { SalaryModalDurationSection, type SalaryModalDurationValue } from "./SalaryModalDurationSection";
import { SalaryModalRatingsSection, type SalaryModalRatingsValue } from "./SalaryModalRatingsSection";
import { SalaryModalReviewSection } from "./SalaryModalReviewSection";
import { SalaryModalActions } from "./SalaryModalActions";

interface SubmitSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    position: string;
    seniority: string;
    salary: number;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    ratings: { salary: number; learning: number; vibes: number };
    comment: string;
  }) => void;
}

const INITIAL_DURATION: SalaryModalDurationValue = {
  isCurrent: false,
  startMonth: "January",
  startYear: "2024",
  endMonth: "December",
  endYear: "2024",
};

const INITIAL_RATINGS: SalaryModalRatingsValue = {
  salary: 3,
  learning: 3,
  vibes: 3,
};

export function SubmitSalaryModal({ isOpen, onClose, onSubmit }: SubmitSalaryModalProps) {
  const [position, setPosition] = useState("");
  const [seniority, setSeniority] = useState("Mid");
  const [salary, setSalary] = useState("");
  const [duration, setDuration] = useState<SalaryModalDurationValue>(INITIAL_DURATION);
  const [ratings, setRatings] = useState<SalaryModalRatingsValue>(INITIAL_RATINGS);
  const [comment, setComment] = useState("");

  const resetForm = () => {
    setPosition("");
    setSalary("");
    setDuration(INITIAL_DURATION);
    setRatings(INITIAL_RATINGS);
    setComment("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDurationChange = (patch: Partial<SalaryModalDurationValue>) => {
    setDuration((prev) => ({ ...prev, ...patch }));
  };

  const handleRatingsChange = (patch: Partial<SalaryModalRatingsValue>) => {
    setRatings((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim() || !salary.trim()) return;

    onSubmit({
      position: position.trim(),
      seniority,
      salary: parseFloat(salary),
      startDate: `${duration.startMonth} ${duration.startYear}`,
      endDate: duration.isCurrent ? "Present" : `${duration.endMonth} ${duration.endYear}`,
      isCurrent: duration.isCurrent,
      ratings,
      comment: comment.trim(),
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent
        showCloseButton
        className="w-full max-w-xl p-0 bg-[#F1EFE9] text-[#0E0E0D] border-2 border-[#0E0E0D] rounded-none shadow-2xl"
      >
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Modal Header */}
          <div className="px-6 pt-7 pb-4 border-b-2 border-[#0E0E0D]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#0E0E0D] text-[#F1EFE9] flex items-center justify-center shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#0E0E0D] tracking-tight italic">
                  Submit Salary & Feedback
                </h2>
                <p className="font-mono text-[0.5rem] text-[#0E0E0D]/50 uppercase tracking-widest mt-0.5">
                  Bring salary transparency to Egyptian tech
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
            <SalaryModalJobDetailsSection
              position={position}
              onPositionChange={setPosition}
              seniority={seniority}
              onSeniorityChange={setSeniority}
            />

            <SalaryModalCompensationSection salary={salary} onSalaryChange={setSalary} />

            <SalaryModalDurationSection value={duration} onChange={handleDurationChange} />

            <SalaryModalRatingsSection value={ratings} onChange={handleRatingsChange} />

            <SalaryModalReviewSection comment={comment} onCommentChange={setComment} />

            <SalaryModalActions onCancel={handleClose} />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitSalaryModal;
