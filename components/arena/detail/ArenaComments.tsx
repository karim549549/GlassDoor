"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CommentSection, type GenericCommentItem } from "@/components/ui/comments";
import { logger } from "@/lib/client/logger";

/** Mirrors `ArenaCommentDto`, with dates as the strings JSON gives us. */
interface ArenaCommentApiItem {
  id: string;
  content: string;
  isPinned: boolean;
  isAnonymous: boolean;
  isDeleted: boolean;
  createdAt: string;
  author: {
    id: string;
    fullName: string | null;
    handle: string | null;
    avatarUrl: string | null;
  } | null;
  replies: ArenaCommentApiItem[];
}

const TOMBSTONE_TEXT = "[ This comment was removed. Its replies are kept below. ]";

/**
 * The API sends no author at all for an anonymous or removed comment, so there
 * is nothing here to accidentally reveal — this only picks the label to show in
 * its place.
 */
function toGenericItem(item: ArenaCommentApiItem): GenericCommentItem {
  return {
    id: item.id,
    author: item.author
      ? {
          fullName: item.author.fullName,
          handle: item.author.handle,
          avatarUrl: item.author.avatarUrl,
        }
      : null,
    content: item.isDeleted ? TOMBSTONE_TEXT : item.content,
    createdAt: item.createdAt,
    isPinned: item.isPinned,
    replies: item.replies.map(toGenericItem),
  };
}

interface ArenaCommentsProps {
  arenaId: string;
}

export function ArenaComments({ arenaId }: ArenaCommentsProps) {
  const [comments, setComments] = useState<GenericCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postAnonymously, setPostAnonymously] = useState(false);

  // Bumped after a successful post to re-run the fetch effect. The thread is
  // never patched locally: the server owns pinning, ordering, and the anonymity
  // transform, so it stays the only thing that decides what a node looks like.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch(`/api/arena/${arenaId}/comments`);
        const data = await res.json();
        if (!isActive) return;
        if (!res.ok || data.error) {
          setError(data.error || "Could not load the discussion.");
          return;
        }
        setComments((data.comments as ArenaCommentApiItem[]).map(toGenericItem));
        setError(null);
      } catch (err) {
        logger.error("Failed to load arena comments", {
          error: err instanceof Error ? err.message : String(err),
        });
        if (isActive) setError("Network error. Could not load the discussion.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isActive = false;
    };
  }, [arenaId, reloadToken]);

  const postComment = useCallback(
    async (content: string, parentId?: string) => {
      try {
        const res = await fetch(`/api/arena/${arenaId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            parentId: parentId ?? null,
            isAnonymous: postAnonymously,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Could not post your comment.");
          return;
        }
        setError(null);
        setReloadToken((token) => token + 1);
      } catch (err) {
        logger.error("Failed to post arena comment", {
          error: err instanceof Error ? err.message : String(err),
        });
        setError("Network error. Your comment was not posted.");
      }
    },
    [arenaId, postAnonymously]
  );

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={postAnonymously}
          onChange={(e) => setPostAnonymously(e.target.checked)}
          className="accent-orange"
        />
        <span>Post anonymously (your name is never sent with the comment)</span>
      </label>

      {error && (
        <p
          role="alert"
          className="border border-destructive bg-destructive/10 p-3 font-mono text-[0.6rem] uppercase tracking-wider text-destructive"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="border border-dashed border-border bg-card/20 p-8 text-center">
          <p className="font-mono text-xs uppercase text-muted-foreground">
            Loading discussion...
          </p>
        </div>
      ) : (
        <CommentSection
          comments={comments}
          onAddComment={(text) => void postComment(text)}
          onAddReply={(targetId, text) => void postComment(text, targetId)}
          emptyMessage="No questions yet. Ask the host anything about the brief, the rules, or the deliverables."
        />
      )}
    </div>
  );
}

export default ArenaComments;
