"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CommentComposerProps {
  onSubmit: (content: string) => void;
}

/** Root-level "write a review" form at the top of the community feed. */
export function CommentComposer({ onSubmit }: CommentComposerProps) {
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
    onSubmit(newCommentText);
    setNewCommentText("");
  };

  return (
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
          aria-label="Write a review or ask a question"
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
  );
}

export default CommentComposer;
