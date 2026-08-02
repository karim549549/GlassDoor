import React from "react";
import { MessageSquare } from "lucide-react";
import type { Comment } from "@/lib/companies/types";
import { CommentComposer } from "./CommentComposer";
import { CommentNode } from "./CommentNode";

export type { Comment };
export { INITIAL_MOCK_COMMENTS } from "@/lib/companies/mockComments";

interface CommentSectionProps {
  comments: Comment[];
  onAddRootComment: (content: string) => void;
  onAddReply: (targetCommentId: string, content: string) => void;
}

export function CommentSection({ comments, onAddRootComment, onAddReply }: CommentSectionProps) {
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

      <CommentComposer onSubmit={onAddRootComment} />

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
export default CommentSection;
