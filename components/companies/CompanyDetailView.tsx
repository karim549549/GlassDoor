"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import type { Company, Comment } from "@/lib/companies/types";
import { INITIAL_MOCK_COMMENTS } from "@/lib/companies/mockComments";
import { CommentSection } from "./CommentSection";
import { CompanyHeroHeader } from "./CompanyHeroHeader";
import { SalaryBenchmarkSection } from "./SalaryBenchmarkSection";

// The submit-salary modal is only ever shown after a user clicks "Submit Salary" -
// dynamically importing it keeps its JS out of the initial page bundle.
const SubmitSalaryModal = dynamic(() => import("./SubmitSalaryModal"));

interface CompanyDetailViewProps {
  company: Company;
}

export function CompanyDetailView({ company }: CompanyDetailViewProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [comments, setComments] = useState<Comment[]>(INITIAL_MOCK_COMMENTS);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const handleAddRootComment = (content: string) => {
    if (!user) return;
    const author = user.fullName || user.email.split("@")[0];
    const newComment: Comment = {
      id: `rc-${Date.now()}`,
      author,
      content,
      date: "Just now",
      replies: [],
    };
    setComments([newComment, ...comments]);
  };

  const handleAddReply = (targetCommentId: string, replyText: string) => {
    if (!user) return;
    const author = user.fullName || user.email.split("@")[0];
    const newReply: Comment = {
      id: `rep-${Date.now()}`,
      author,
      content: replyText,
      date: "Just now",
      replies: [],
    };

    const addReplyRecursive = (list: Comment[]): Comment[] => {
      return list.map((c) => {
        if (c.id === targetCommentId) {
          return {
            ...c,
            replies: [...c.replies, newReply],
          };
        } else if (c.replies.length > 0) {
          return {
            ...c,
            replies: addReplyRecursive(c.replies),
          };
        }
        return c;
      });
    };

    setComments(addReplyRecursive(comments));
  };

  const handleOpenSubmitSalaryModal = () => {
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSalaryFeedback = (data: {
    position: string;
    seniority: string;
    salary: number;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    ratings: { salary: number; learning: number; vibes: number };
    comment: string;
  }) => {
    if (!user) return;
    const author = user.fullName || user.email.split("@")[0];

    const commentText = data.comment
      ? data.comment
      : `Verified my salary details: ${data.salary.toLocaleString()} EGP/month base net. Worked from ${data.startDate} to ${data.endDate}.`;

    const newComment: Comment = {
      id: `fb-${Date.now()}`,
      author,
      content: commentText,
      date: "Just now",
      role: data.position,
      seniority: data.seniority,
      ratings: data.ratings,
      replies: [],
    };

    setComments([newComment, ...comments]);
  };

  return (
    <div className="w-full">
      {/* 1. Header Cover Background & Content Overlay */}
      <CompanyHeroHeader company={company} onSubmitSalary={handleOpenSubmitSalaryModal} />

      {/* 2. Interactive Salaries Graph Section */}
      <SalaryBenchmarkSection roles={company.roles} />

      {/* 3. Community Feed & Infinite Nested Replies */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="border-t-2 border-foreground pt-12">
          <CommentSection
            comments={comments}
            onAddRootComment={handleAddRootComment}
            onAddReply={handleAddReply}
          />
        </div>
      </div>

      {/* Submit Salary Dialogue Modal */}
      <SubmitSalaryModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitSalaryFeedback}
      />
    </div>
  );
}
export default CompanyDetailView;
