"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { MessageSquare, CornerDownRight, Send, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  role?: string;
  seniority?: string;
  ratings?: { salary: number; learning: number; vibes: number };
  replies: Comment[];
}

export const INITIAL_MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Ahmed Aly",
    content: "Vodafone Egypt has been standardizing ranges for Mid-level developers. Good benefits overall but core salary increases don't match inflation.",
    date: "18 hours ago",
    role: "Backend Engineer",
    seniority: "Mid",
    ratings: { salary: 3, learning: 4, vibes: 4 },
    replies: [
      {
        id: "c1-r1",
        author: "Mohamed H.",
        content: "Agree, their tech stack is a bit legacy in some departments but the work life balance is great.",
        date: "12 hours ago",
        replies: [
          {
            id: "c1-r1-r1",
            author: "Sara Mansour",
            content: "Depends on the team, some teams are working on modern cloud migrations and offer hybrid flexibility.",
            date: "6 hours ago",
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    author: "Tarek Fahmy",
    content: "Had a senior backend engineer interview recently. The technical assessment process was smooth but they couldn't match market rates for freelancers.",
    date: "2 days ago",
    role: "Backend Engineer",
    seniority: "Senior",
    ratings: { salary: 2, learning: 3, vibes: 5 },
    replies: [],
  },
];

interface CommentSectionProps {
  comments: Comment[];
  onAddRootComment: (content: string) => void;
  onAddReply: (targetCommentId: string, content: string) => void;
}

export function CommentSection({ comments, onAddRootComment, onAddReply }: CommentSectionProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [newCommentText, setNewCommentText] = useState("");

  const handleFocus = () => {
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  };

  const handlePostRootComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!newCommentText.trim()) return;
    onAddRootComment(newCommentText);
    setNewCommentText("");
  };

  return (
    <div className="w-full text-left">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-6 w-6 text-foreground" />
        <h3 className="font-display text-2xl font-medium text-foreground">
          Community Feed
        </h3>
      </div>
      <p className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest mb-8">
        Anonymized internal employee reviews, interview feedback, and nested discussions
      </p>

      {/* Root Comment Form */}
      <form onSubmit={handlePostRootComment} className="border-2 border-foreground bg-card p-5 mb-10">
        <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5 font-bold">
          {!user && <Lock className="h-3 w-3 text-orange" />}
          Write a Review or Ask a Question {!user && "(Sign In Required)"}
        </span>
        
        <div className="w-full mb-4">
          <textarea
            placeholder={
              user
                ? "What is your experience working or interviewing here? No HR filters, share honest feedback..."
                : "Please click here or sign in to write a review or reply..."
            }
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onFocus={handleFocus}
            rows={3}
            className="w-full border border-border p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none focus:border-foreground resize-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wide">
            {user ? (
              <span>Posting as: <strong className="text-foreground">{user.fullName || user.email}</strong></span>
            ) : (
              <span className="text-orange">Login required to publish feedback</span>
            )}
          </div>
          <Button type="submit" className="flex items-center gap-2">
            <Send className="h-3.5 w-3.5" />
            Publish feedback
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            onAddReply={onAddReply}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentNodeProps {
  comment: Comment;
  onAddReply: (targetId: string, text: string) => void;
  depth?: number;
}

function CommentNode({ comment, onAddReply, depth = 0 }: CommentNodeProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplyTrigger = () => {
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!replyText.trim()) return;

    onAddReply(comment.id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="flex flex-col text-left group">
      {/* Outer borderless comment box with visual vertical lines */}
      <div className="border border-border/70 hover:border-foreground bg-card/45 p-4 transition-all duration-150">
        <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-left">
              <span className="font-mono text-[0.65rem] font-bold text-foreground uppercase">
                {comment.author}
              </span>
              {(comment.seniority || comment.role) && (
                <span className="font-mono text-[0.52rem] text-orange uppercase tracking-wider mt-0.5">
                  {comment.seniority} {comment.role}
                </span>
              )}
            </div>
            {depth > 0 && (
              <span className="font-mono text-[0.52rem] text-muted-foreground uppercase flex items-center gap-1 self-start mt-0.5">
                <CornerDownRight className="h-2.5 w-2.5" /> reply
              </span>
            )}
          </div>
          <span className="font-mono text-[0.55rem] text-muted-foreground self-start mt-0.5">
            {comment.date}
          </span>
        </div>

        <p className="font-sans text-[0.75rem] text-foreground leading-relaxed">
          {comment.content}
        </p>

        {/* 3-Factor Ratings display */}
        {comment.ratings && (
          <div className="mt-3 pt-2.5 border-t border-border/20 flex flex-wrap gap-4 font-mono text-[0.55rem] uppercase text-muted-foreground">
            <span className="flex items-center gap-1">Salary: <strong className="text-foreground">{comment.ratings.salary}/5</strong></span>
            <span className="flex items-center gap-1">Learning: <strong className="text-foreground">{comment.ratings.learning}/5</strong></span>
            <span className="flex items-center gap-1">Vibes: <strong className="text-foreground">{comment.ratings.vibes}/5</strong></span>
          </div>
        )}

        {/* Reply Action Trigger */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleReplyTrigger}
            className="font-mono text-[0.55rem] text-muted-foreground hover:text-foreground hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
          >
            {!user && <Lock className="h-2.5 w-2.5 text-orange" />}
            {isReplying ? "Cancel" : "Reply"}
          </button>
        </div>

        {/* Inline Nesting Form */}
        {isReplying && user && (
          <form onSubmit={handleSubmitReply} className="mt-4 p-4 border-t border-dashed border-border bg-secondary/20">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[0.52rem] uppercase tracking-wider text-muted-foreground">
                Reply to {comment.author}
              </span>
              <span className="font-mono text-[0.52rem] text-muted-foreground uppercase">
                As: <strong className="text-foreground">{user.fullName || user.email}</strong>
              </span>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-border p-2 font-mono text-[0.6rem] uppercase bg-transparent outline-none focus:border-foreground"
                autoFocus
              />
              <Button type="submit" className="!py-1.5 !px-3 !text-[0.55rem] shrink-0">
                Post reply
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Recursive Render of Sub-Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-5 border-l-2 border-border/80 ml-3.5 mt-3.5 space-y-3.5">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              onAddReply={onAddReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
export default CommentSection;
