"use client";

import React, { useState } from "react";
import { MessageSquare, CornerDownRight, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  replies: Comment[];
}

const INITIAL_MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Ahmed Aly",
    content: "Vodafone Egypt has been standardizing ranges for Mid-level developers. Good benefits overall but core salary increases don't match inflation.",
    date: "18 hours ago",
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
    replies: [],
  },
];

export function CommentSection({ companyId }: { companyId: number }) {
  const [comments, setComments] = useState<Comment[]>(INITIAL_MOCK_COMMENTS);
  const [newCommentText, setNewCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handlePostRootComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const author = authorName.trim() || "Anonymous Egyptian";
    const newComment: Comment = {
      id: `rc-${Date.now()}`,
      author,
      content: newCommentText,
      date: "Just now",
      replies: [],
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
    setAuthorName("");
  };

  const handleAddReply = (targetCommentId: string, replyText: string, replierName: string) => {
    const author = replierName.trim() || "Anonymous Egyptian";
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
        <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground mb-3 block">
          Write a Review or Ask a Question
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Your name / title (Optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-border p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none focus:border-foreground"
            />
          </div>
          <div className="md:col-span-3">
            <textarea
              placeholder="What is your experience working or interviewing here? No HR filters, share honest feedback..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              rows={3}
              className="w-full border border-border p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none focus:border-foreground resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
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
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentNodeProps {
  comment: Comment;
  onAddReply: (targetId: string, text: string, name: string) => void;
  depth?: number;
}

function CommentNode({ comment, onAddReply, depth = 0 }: CommentNodeProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replierName, setReplierName] = useState("");

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(comment.id, replyText, replierName);
    setReplyText("");
    setReplierName("");
    setIsReplying(false);
  };

  return (
    <div className="flex flex-col text-left group">
      {/* Outer borderless comment box with visual vertical lines */}
      <div className="border border-border/70 hover:border-foreground bg-card/45 p-4 transition-all duration-150">
        <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.65rem] font-bold text-foreground uppercase">
              {comment.author}
            </span>
            {depth > 0 && (
              <span className="font-mono text-[0.52rem] text-muted-foreground uppercase flex items-center gap-1">
                <CornerDownRight className="h-2.5 w-2.5" /> reply
              </span>
            )}
          </div>
          <span className="font-mono text-[0.55rem] text-muted-foreground">
            {comment.date}
          </span>
        </div>

        <p className="font-sans text-[0.75rem] text-foreground leading-relaxed">
          {comment.content}
        </p>

        {/* Reply Action Trigger */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="font-mono text-[0.55rem] text-muted-foreground hover:text-foreground hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none p-0"
          >
            {isReplying ? "Cancel" : "Reply"}
          </button>
        </div>

        {/* Inline Nesting Form */}
        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-4 p-4 border-t border-dashed border-border bg-secondary/20">
            <span className="font-mono text-[0.52rem] uppercase tracking-wider text-muted-foreground mb-2 block">
              Reply to {comment.author}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={replierName}
                onChange={(e) => setReplierName(e.target.value)}
                className="w-full border border-border p-2 font-mono text-[0.6rem] uppercase bg-transparent outline-none focus:border-foreground"
              />
              <input
                type="text"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full md:col-span-3 border border-border p-2 font-mono text-[0.6rem] uppercase bg-transparent outline-none focus:border-foreground"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" className="!py-1.5 !px-3 !text-[0.55rem]">
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
