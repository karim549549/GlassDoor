"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import { RailPanel } from "./BoardSidebar";
import { timeUntil } from "./ArenaRow";

/**
 * Invitations addressed to the reader, at the top of the board's rail.
 *
 * This is where "where do I see my invitations" is answered. It sits above the
 * filters rather than on a page of its own because an invitation is a thing
 * with a clock on it: a separate screen nobody visits is the same as no
 * feature, and the board is the page someone already opens to find something
 * to enter.
 *
 * Accepting enters the arena directly - the point of the whole mechanism is
 * that a private arena stops needing a shared code that everyone can forward.
 */

export interface PendingInvitation {
  id: string;
  arenaId: string;
  arenaTitle: string;
  arenaSlug: string;
  senderName: string;
  senderHandle: string | null;
  /** ISO. When registration on that arena shuts. */
  registrationEnd: string;
  isPrivate: boolean;
}

export function InvitationsPanel({
  invitations,
  now,
}: {
  invitations: PendingInvitation[];
  now: Date;
}) {
  const router = useRouter();
  const { toast } = useToast();
  // Answered invitations leave immediately rather than waiting for the server
  // round-trip to repaint the page. The row is gone either way; the only
  // question is whether the reader watches it sit there first.
  const [answered, setAnswered] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const open = invitations.filter((i) => !answered.includes(i.id));
  if (open.length === 0) return null;

  const respond = async (invitation: PendingInvitation, action: "accept" | "decline") => {
    setBusyId(invitation.id);
    try {
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        toast(result.error || "Could not answer that invitation.", "error");
        return;
      }

      setAnswered((prev) => [...prev, invitation.id]);
      toast(
        action === "accept" ? `You're in: ${invitation.arenaTitle}` : "Invitation declined.",
        action === "accept" ? "success" : "info"
      );
      // The board is server-rendered, so an accepted arena only picks up its
      // "You're in" marker after the page data is refetched.
      router.refresh();
    } catch (err) {
      logger.error("Invitation response failed", {
        invitationId: invitation.id,
        error: err instanceof Error ? err.message : String(err),
      });
      toast("Network error. Nothing was answered.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RailPanel title={`Invitations · ${open.length}`} accent>
      <ul className="divide-y divide-foreground/10">
        {open.map((invitation) => {
          const busy = busyId === invitation.id;
          const closesIn = timeUntil(new Date(invitation.registrationEnd), now);

          return (
            <li key={invitation.id} className="px-4 py-3.5">
              <Link
                href={`/arena/${invitation.arenaSlug}`}
                className="font-sans text-sm font-semibold leading-snug text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                {invitation.arenaTitle}
              </Link>

              <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground/60">
                From {invitation.senderName}
                {invitation.isPrivate && " · Invite only"}
                {closesIn && ` · closes in ${closesIn}`}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => respond(invitation, "accept")}
                  className="cursor-pointer border-2 border-orange bg-orange px-3 py-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#0E0E0D] transition-all hover:bg-transparent hover:text-orange-ink active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {busy ? "…" : "Accept"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => respond(invitation, "decline")}
                  className="cursor-pointer border-b border-transparent px-1 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  Decline
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </RailPanel>
  );
}

export default InvitationsPanel;
