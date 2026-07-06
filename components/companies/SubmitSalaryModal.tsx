"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Star, Calendar, Briefcase, Coins, Plus } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

const SENIORITIES = ["Junior", "Mid", "Senior", "Team Lead", "Architect", "Principal"];

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

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                star <= (hovered || value)
                  ? "text-orange fill-orange"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function SubmitSalaryModal({ isOpen, onClose, onSubmit }: SubmitSalaryModalProps) {
  const [position, setPosition] = useState("");
  const [seniority, setSeniority] = useState("Mid");
  const [salary, setSalary] = useState("");
  const [startMonth, setStartMonth] = useState("January");
  const [startYear, setStartYear] = useState("2024");
  const [endMonth, setEndMonth] = useState("December");
  const [endYear, setEndYear] = useState("2024");
  const [isCurrent, setIsCurrent] = useState(false);
  const [ratingSalary, setRatingSalary] = useState(3);
  const [ratingLearning, setRatingLearning] = useState(3);
  const [ratingVibes, setRatingVibes] = useState(3);
  const [comment, setComment] = useState("");

  const resetForm = () => {
    setPosition("");
    setSalary("");
    setIsCurrent(false);
    setStartMonth("January");
    setStartYear("2024");
    setEndMonth("December");
    setEndYear("2024");
    setRatingSalary(3);
    setRatingLearning(3);
    setRatingVibes(3);
    setComment("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim() || !salary.trim()) return;

    onSubmit({
      position: position.trim(),
      seniority,
      salary: parseFloat(salary),
      startDate: `${startMonth} ${startYear}`,
      endDate: isCurrent ? "Present" : `${endMonth} ${endYear}`,
      isCurrent,
      ratings: { salary: ratingSalary, learning: ratingLearning, vibes: ratingVibes },
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

            {/* SECTION 1 — Job Details */}
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
                <Briefcase className="h-3 w-3" /> Job Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
                    Position / Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Engineer"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none placeholder:text-[#0E0E0D]/30 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
                    Seniority Level *
                  </label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] bg-[#F1EFE9] outline-none uppercase cursor-pointer transition-colors"
                  >
                    {SENIORITIES.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2 — Compensation */}
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
                <Coins className="h-3 w-3" /> Compensation
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
                  Monthly Base Salary (Net EGP) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  required
                  min={0}
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] bg-transparent outline-none placeholder:text-[#0E0E0D]/30 transition-colors"
                />
              </div>
            </div>

            {/* SECTION 3 — Work Duration */}
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
                <Calendar className="h-3 w-3" /> Work Duration
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[#0E0E0D]"
                />
                <label htmlFor="isCurrent" className="font-mono text-[0.6rem] uppercase tracking-wider cursor-pointer font-bold text-[#0E0E0D]">
                  I currently work here
                </label>
              </div>

              <div className={`grid gap-4 ${isCurrent ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                <div className="space-y-1.5">
                  <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
                    Start Date
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="flex-1 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] uppercase cursor-pointer"
                    >
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      className="w-24 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] cursor-pointer"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="space-y-1.5">
                    <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
                      End Date
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={endMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        className="flex-1 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] uppercase cursor-pointer"
                      >
                        {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                        className="w-24 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] cursor-pointer"
                      >
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4 — 3-Factor Ratings */}
            <div>
              <div className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
                Rate Workplace Environment (1-5 Stars)
              </div>
              <div className="space-y-3">
                <StarRating label="Salary Satisfaction" value={ratingSalary} onChange={setRatingSalary} />
                <StarRating label="Learning Curve" value={ratingLearning} onChange={setRatingLearning} />
                <StarRating label="Workplace Vibes" value={ratingVibes} onChange={setRatingVibes} />
              </div>
            </div>

            {/* SECTION 5 — Optional Comment */}
            <div>
              <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block mb-1.5">
                Review Message (Optional)
              </label>
              <textarea
                placeholder="Tell other developers about the workload, management, or interview experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none placeholder:text-[#0E0E0D]/30 resize-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="font-mono text-[0.6rem] uppercase tracking-wider px-5 py-3 border border-[#0E0E0D]/30 hover:border-[#0E0E0D] text-[#0E0E0D]/60 hover:text-[#0E0E0D] cursor-pointer transition-colors bg-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="font-mono text-[0.6rem] uppercase tracking-wider px-6 py-3 bg-[#0E0E0D] text-[#F1EFE9] hover:bg-orange hover:text-[#0E0E0D] cursor-pointer transition-colors border border-[#0E0E0D] font-bold"
              >
                Submit Details
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitSalaryModal;
