"use client";

import React, { useState } from "react";
import { MessageSquare, Send, ChevronDown } from "lucide-react";
import { ArenaCommentNode, CommentType } from "./ArenaCommentNode";

// ── Mock seed data ────────────────────────────────────────────────────────────
const MOCK_COMMENTS: CommentType[] = [
  {
    id: "c1",
    author: { handle: "alex_dev", fullName: "Alex River", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    content: "Absolutely hyped for this arena! The distributed AI challenge is exactly what the ecosystem needs. Anyone already forming teams?",
    likes: 14, likedByMe: false, createdAt: "2h ago",
    replies: [
      {
        id: "c1-r1",
        author: { handle: "sarah_c", fullName: "Sarah Connor", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
        content: "Yes! Cyber_Warriors is looking for a solid backend engineer. DM if you're interested.",
        likes: 7, likedByMe: false, createdAt: "1h ago",
        replies: [
          {
            id: "c1-r1-r1",
            author: { handle: "john_hacks", fullName: "John Hack", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
            content: "I'm in. Sent you a message. Let's build something that ships.",
            likes: 3, likedByMe: false, createdAt: "45m ago",
            replies: [],
          },
        ],
      },
      {
        id: "c1-r2",
        author: { handle: "dev_dave", fullName: "Dave Code", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        content: "Prisma_Pirates still has one slot open if anyone wants to join a full-stack team.",
        likes: 5, likedByMe: true, createdAt: "55m ago",
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    author: { handle: "emma_ui", fullName: "Emma Watson", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
    content: "Quick question — are Figma design files mandatory for solo participants too, or just teams?",
    likes: 6, likedByMe: false, createdAt: "3h ago",
    replies: [
      {
        id: "c2-r1",
        author: { handle: "alex_dev", fullName: "Alex River", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        content: "Figma is optional per the submission requirements card above. Only GitHub repo and writeup are mandatory for everyone.",
        likes: 9, likedByMe: false, createdAt: "2h ago",
        replies: [],
      },
    ],
  },
  {
    id: "c3",
    author: { handle: "john_hacks", fullName: "John Hack", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    content: "The rules are clear and fair. Love that open-source libraries are allowed — this will push people to innovate at the architecture layer rather than reinventing the wheel.",
    likes: 21, likedByMe: false, createdAt: "5h ago",
    replies: [],
  },
  {
    id: "c4",
    author: { handle: "dev_dave", fullName: "Dave Code", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    content: "Will there be a live judging session or is it purely async review? That would make a huge difference in presentation preparation.",
    likes: 4, likedByMe: false, createdAt: "6h ago",
    replies: [],
  },
  {
    id: "c5",
    author: { handle: "sarah_c", fullName: "Sarah Connor", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
    content: "Registered! Really hoping the leaderboard updates in real time during judging — adds so much tension and excitement.",
    likes: 11, likedByMe: false, createdAt: "8h ago",
    replies: [],
  },
  {
    id: "c6",
    author: { handle: "emma_ui", fullName: "Emma Watson", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
    content: "This platform's UX is genuinely refreshing. Happy to participate and also give product feedback post-event.",
    likes: 8, likedByMe: false, createdAt: "10h ago",
    replies: [],
  },
];

const PAGE_SIZE = 3;

interface ArenaCommentsSectionProps {
  isGuest?: boolean;
  onLoginRedirect?: () => void;
  limit?: number;
  startIndex?: number;
  showInput?: boolean;
  hideHeader?: boolean;
}

export function ArenaCommentsSection({
  isGuest = false,
  onLoginRedirect = () => {},
  limit,
  startIndex = 0,
  showInput = true,
  hideHeader = false,
}: ArenaCommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(MOCK_COMMENTS);
  const [visibleCount, setVisibleCount] = useState(limit ?? PAGE_SIZE);
  const [newCommentText, setNewCommentText] = useState("");

  const slicedComments = comments.slice(startIndex);
  const visibleComments = slicedComments.slice(0, visibleCount);
  const hasMore = visibleCount < slicedComments.length;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddTopLevelComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isGuest) return;

    const newComment: CommentType = {
      id: `c-${Date.now()}`,
      author: { handle: "you_dev", fullName: "You", avatarUrl: null },
      content: newCommentText.trim(),
      likes: 0,
      likedByMe: false,
      createdAt: "just now",
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
  };

  // Recursive like toggle across the entire tree
  const toggleLike = (id: string, nodes: CommentType[]): CommentType[] =>
    nodes.map((c) =>
      c.id === id
        ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 }
        : { ...c, replies: toggleLike(id, c.replies) }
    );

  const handleLike = (commentId: string) => {
    setComments((prev) => toggleLike(commentId, prev));
  };

  // Recursive reply insertion across the entire tree
  const insertReply = (parentId: string, reply: CommentType, nodes: CommentType[]): CommentType[] =>
    nodes.map((c) =>
      c.id === parentId
        ? { ...c, replies: [reply, ...c.replies] }
        : { ...c, replies: insertReply(parentId, reply, c.replies) }
    );

  const handleAddReply = (parentId: string, content: string) => {
    const reply: CommentType = {
      id: `r-${Date.now()}`,
      author: { handle: "you_dev", fullName: "You", avatarUrl: null },
      content,
      likes: 0,
      likedByMe: false,
      createdAt: "just now",
      replies: [],
    };
    setComments((prev) => insertReply(parentId, reply, prev));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b-2 border-[#0E0E0D] pb-3">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
            <MessageSquare className="w-4 h-4" />
            <span>DISCUSSION &amp; COMMENTS</span>
          </div>
          <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold">
            {comments.length} COMMENTS
          </span>
        </div>
      )}

      {/* New Top-Level Comment Form */}
      {showInput && (
        isGuest ? (
          <div
            onClick={onLoginRedirect}
            className="p-4 bg-white border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] flex items-center gap-3 cursor-pointer hover:bg-[#0E0E0D]/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#0E0E0D]/10 border-2 border-dashed border-[#0E0E0D]/30 flex items-center justify-center shrink-0">
              <span className="font-mono text-[0.5rem] text-[#0E0E0D]/50 font-bold">?</span>
            </div>
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold">
              LOG IN TO JOIN THE DISCUSSION
            </span>
          </div>
        ) : (
          <form onSubmit={handleAddTopLevelComment} className="flex gap-2 items-start">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-orange/20 border-2 border-orange shrink-0 mt-0.5">
              <span className="w-full h-full flex items-center justify-center font-mono font-bold text-[0.5rem] text-orange">
                YOU
              </span>
            </div>
            <div className="flex-1 flex gap-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="ADD A COMMENT TO THIS ARENA..."
                rows={2}
                className="flex-1 px-3 py-2 border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange resize-none"
                aria-label="New comment"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="self-end px-3 py-2.5 bg-orange text-white border-2 border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-orange/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )
      )}

      {/* Comment Tree */}
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <ArenaCommentNode
            key={comment.id}
            comment={comment}
            depth={0}
            isGuest={isGuest}
            onLoginRedirect={onLoginRedirect}
            onLike={handleLike}
            onAddReply={handleAddReply}
          />
        ))}
      </div>

      {/* Paginated Load More */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 py-2.5 px-6 bg-white border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D] font-mono text-[0.62rem] uppercase tracking-widest font-bold text-[#0E0E0D] hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
            <span>READ MORE COMMENTS ({comments.length - visibleCount} REMAINING)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ArenaCommentsSection;
