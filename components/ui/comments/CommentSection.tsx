"use client";

import React from "react";
import { CommentComposer } from "./CommentComposer";
import { CommentNode, type GenericCommentItem } from "./CommentNode";
import { MessageSquare } from "lucide-react";

export interface CommentSectionProps {
  comments: GenericCommentItem[];
  onAddComment: (text: string) => void;
  onAddReply?: (targetId: string, text: string) => void;
  onLike?: (targetId: string) => void;
  title?: string;
  placeholder?: string;
  emptyMessage?: string;
}

/** Unified Discussion & Q&A section with recursive threaded replies. */
export function CommentSection({
  comments,
  onAddComment,
  onAddReply,
  onLike,
  title = "Discussion & Clarifications",
  placeholder,
  emptyMessage = "No comments or questions posted yet. Be the first to start the discussion.",
}: CommentSectionProps) {
  return (
    <div className="w-full flex flex-col text-left">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-foreground">
        <MessageSquare className="h-4 w-4 text-orange" />
        <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
          {title} ({comments.length})
        </h3>
      </div>

      <CommentComposer onSubmit={onAddComment} placeholder={placeholder} label={title} />

      {comments.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center bg-card/20">
          <p className="font-mono text-xs text-muted-foreground uppercase">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              onAddReply={onAddReply}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
