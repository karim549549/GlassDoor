import React from "react";

interface SalaryModalReviewSectionProps {
  comment: string;
  onCommentChange: (value: string) => void;
}

export function SalaryModalReviewSection({ comment, onCommentChange }: SalaryModalReviewSectionProps) {
  return (
    <div>
      <label htmlFor="salary-review-comment" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block mb-1.5">
        Review Message (Optional)
      </label>
      <textarea
        id="salary-review-comment"
        placeholder="Tell other developers about the workload, management, or interview experience..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        rows={3}
        className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none placeholder:text-[#0E0E0D]/30 resize-none transition-colors"
      />
    </div>
  );
}

export default SalaryModalReviewSection;
