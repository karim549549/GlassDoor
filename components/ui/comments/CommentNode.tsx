"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/client/useAuthStore";
import { CornerDownRight, ThumbsUp, Pin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface GenericCommentItem {
  id: string;
  author?: {
    fullName?: string | null;
    handle?: string | null;
    avatarUrl?: string | null;
  } | null;
  content: string;
  createdAt: string | Date;
  likes?: number;
  isPinned?: boolean;
  replies?: GenericCommentItem[];
}

export interface CommentNodeProps {
  comment: GenericCommentItem;
  onAddReply?: (targetId: string, text: string) => void;
  onLike?: (targetId: string) => void;
  depth?: number;
}

function formatCommentDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/** A single comment/reply node, recursively rendering its nested replies. */
export function CommentNode({
  comment,
  onAddReply,
  onLike,
  depth = 0,
}: CommentNodeProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const displayName =
    comment.author?.fullName?.trim() ||
    comment.author?.handle?.trim() ||
    "Anonymous Contender";

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

    onAddReply?.(comment.id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="flex flex-col text-left group">
      <div
        className={`border p-4 transition-all duration-150 ${
          comment.isPinned
            ? "border-orange bg-orange/5"
            : "border-border/70 hover:border-foreground bg-card/45"
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-left">
              <span className="font-mono text-[0.65rem] font-bold text-foreground uppercase flex items-center gap-1.5">
                {displayName}
                {comment.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[0.55rem] font-mono uppercase bg-orange/20 text-orange px-1.5 py-0.5 border border-orange/40">
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </span>
                )}
              </span>
            </div>
            {depth > 0 && (
              <span className="font-mono text-[0.52rem] text-muted-foreground uppercase flex items-center gap-1 self-start mt-0.5">
                <CornerDownRight className="h-2.5 w-2.5" /> reply
              </span>
            )}
          </div>
          <span className="font-mono text-[0.55rem] text-muted-foreground self-start mt-0.5">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>

        <p className="font-sans text-[0.75rem] text-foreground leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20 font-mono text-[0.55rem] text-muted-foreground">
          {onLike ? (
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{comment.likes || 0}</span>
            </button>
          ) : (
            <span />
          )}

          {onAddReply && (
            <button
              type="button"
              onClick={handleReplyTrigger}
              className="hover:text-foreground uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isReplying ? "[ Cancel ]" : "[ Reply ]"}
            </button>
          )}
        </div>

        {isReplying && onAddReply && (
          <form onSubmit={handleSubmitReply} className="mt-3 pt-3 border-t border-border">
            <textarea
              placeholder={`Replying to @${displayName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              className="w-full border border-border p-2 font-mono text-[0.65rem] bg-transparent outline-none focus:border-foreground resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Reply</Button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 md:ml-6 pl-2 border-l-2 border-border/40 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              onAddReply={onAddReply}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentNode;
