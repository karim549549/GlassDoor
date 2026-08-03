"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Reply, ChevronDown, ChevronUp, Send } from "lucide-react";

export interface CommentType {
  id: string;
  author: {
    handle: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  content: string;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
  replies: CommentType[];
}

interface ArenaCommentNodeProps {
  comment: CommentType;
  depth?: number;
  isGuest: boolean;
  onLoginRedirect: () => void;
  onLike: (commentId: string) => void;
  onAddReply: (parentId: string, content: string) => void;
}

export function ArenaCommentNode({
  comment,
  depth = 0,
  isGuest,
  onLoginRedirect,
  onLike,
  onAddReply,
}: ArenaCommentNodeProps) {
  const [showReplies, setShowReplies] = useState(depth < 1);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const MAX_VISUAL_DEPTH = 6;
  const indentDepth = Math.min(depth, MAX_VISUAL_DEPTH);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const handleReplyClick = () => {
    if (isGuest) {
      onLoginRedirect();
      return;
    }
    setShowReplyForm((prev) => !prev);
  };

  return (
    <div
      className={`relative ${indentDepth > 0 ? "pl-4 sm:pl-6 border-l-2 border-[#0E0E0D]/10" : ""}`}
    >
      {/* Comment Card */}
      <div className="bg-white border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] p-4 space-y-2.5">
        {/* Author Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-orange/20 border border-orange shrink-0">
              {comment.author.avatarUrl ? (
                <Image src={comment.author.avatarUrl} alt={comment.author.handle} fill className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-mono font-bold text-[0.45rem] text-orange">
                  {comment.author.handle[0].toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-mono text-[0.65rem] font-bold uppercase text-[#0E0E0D]">
              @{comment.author.handle}
            </span>
          </div>
          <span className="font-mono text-[0.5rem] text-[#0E0E0D]/40 uppercase tracking-wider shrink-0">
            {comment.createdAt}
          </span>
        </div>

        {/* Comment Content */}
        <p className="font-sans text-sm text-[#0E0E0D]/85 leading-relaxed">
          {comment.content}
        </p>

        {/* Action Row */}
        <div className="flex items-center gap-4 pt-1">
          {/* Like Button */}
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              comment.likedByMe
                ? "text-orange"
                : "text-[#0E0E0D]/50 hover:text-orange"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${comment.likedByMe ? "fill-orange text-orange" : ""}`} />
            <span>{comment.likes}</span>
          </button>

          {/* Reply Button */}
          <button
            onClick={handleReplyClick}
            className="flex items-center gap-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider text-[#0E0E0D]/50 hover:text-orange transition-colors cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>REPLY</span>
          </button>

          {/* Show/Hide Replies Toggle */}
          {comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((prev) => !prev)}
              className="flex items-center gap-1 font-mono text-[0.55rem] font-bold uppercase tracking-wider text-[#0E0E0D]/40 hover:text-[#0E0E0D] transition-colors ml-auto cursor-pointer"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>HIDE {comment.replies.length} {comment.replies.length === 1 ? "REPLY" : "REPLIES"}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>VIEW {comment.replies.length} {comment.replies.length === 1 ? "REPLY" : "REPLIES"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Inline Reply Form */}
      {showReplyForm && !isGuest && (
        <div className="mt-2 ml-4">
          <form onSubmit={handleReplySubmit} className="flex gap-2">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to @${comment.author.handle}...`}
              className="flex-1 px-3 py-2 border-2 border-[#0E0E0D] font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange"
              aria-label={`Reply to @${comment.author.handle}`}
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-2 bg-[#0E0E0D] text-[#F1EFE9] border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#FF5722] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
            >
              <Send className="w-3.5 h-3.5 text-orange" />
            </button>
          </form>
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <ArenaCommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isGuest={isGuest}
              onLoginRedirect={onLoginRedirect}
              onLike={onLike}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ArenaCommentNode;
