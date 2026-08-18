"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import { DetailPanel } from "./panels";

/**
 * Everything only the host sees: who has been invited, who to invite next, and
 * how to call the whole thing off.
 *
 * Kept out of the main column rather than folded into it, because none of it
 * is about the arena - it is about running the arena, and an entrant scrolling
 * past a roster of pending invitations learns things about other people that
 * are not theirs to read.
 */

export interface HostInvitation {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  receiver: {
    fullName: string | null;
    handle: string | null;
    avatarUrl: string | null;
  };
}

const STATUS_TONE: Record<HostInvitation["status"], string> = {
  PENDING: "text-foreground/55",
  ACCEPTED: "text-orange-ink",
  REJECTED: "text-foreground/40",
};

const STATUS_LABEL: Record<HostInvitation["status"], string> = {
  PENDING: "Waiting",
  ACCEPTED: "In",
  REJECTED: "Declined",
};

export function ArenaHostSections({
  arenaId,
  invitations: initial,
  inviteCode,
  isPrivate,
  canStillInvite,
  canCancel,
}: {
  arenaId: string;
  invitations: HostInvitation[];
  /** Host only, by construction - the DTO does not emit it to anyone else. */
  inviteCode: string | null;
  isPrivate: boolean;
  /** False once registration has closed; there is nothing left to invite to. */
  canStillInvite: boolean;
  /** False once the arena has run or been called off already. */
  canCancel: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState(initial);
  const [handle, setHandle] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const send = async () => {
    const trimmed = handle.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await fetch(`/api/arena/${arenaId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast(data.error || "Could not send that invitation.", "error");
        return;
      }

      setInvitations((prev) => [data.invitation, ...prev]);
      setHandle("");
      toast("Invitation sent.", "success");
    } catch (err) {
      logger.error("Invitation send failed", {
        arenaId,
        error: err instanceof Error ? err.message : String(err),
      });
      toast("Network error. Nothing was sent.", "error");
    } finally {
      setSending(false);
    }
  };

  const cancelArena = async () => {
    setCanceling(true);
    try {
      const res = await fetch(`/api/arena/${arenaId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast(data.error || "Could not call this off.", "error");
        return;
      }

      toast("Called off. Everyone who entered will see it on the page.", "success");
      router.refresh();
    } catch (err) {
      logger.error("Arena cancel failed", {
        arenaId,
        error: err instanceof Error ? err.message : String(err),
      });
      toast("Network error. Nothing changed.", "error");
    } finally {
      setCanceling(false);
      setConfirmingCancel(false);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast("Could not reach the clipboard. Select the code and copy it.", "error");
    }
  };

  const accepted = invitations.filter((i) => i.status === "ACCEPTED").length;

  return (
    <div className="flex flex-col gap-6">
      <DetailPanel
        title="Invitations"
        aside={invitations.length > 0 ? `${accepted} of ${invitations.length} in` : undefined}
      >
        {canStillInvite ? (
          <div className="flex flex-col gap-2 border-b border-foreground/10 px-4 py-4">
            <label
              htmlFor="invite-handle"
              className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-foreground/50"
            >
              Invite by handle
            </label>
            <div className="flex gap-2">
              <input
                id="invite-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => {
                  // The form is one field and one button; Enter should send it.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="@someone"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 border border-foreground/25 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-foreground/35 focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              />
              <button
                type="button"
                disabled={sending || handle.trim().length === 0}
                onClick={send}
                className="cursor-pointer border-2 border-foreground bg-foreground px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-background transition-all hover:bg-transparent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                {sending ? "…" : "Invite"}
              </button>
            </div>
            <p className="font-sans text-[0.78rem] leading-relaxed text-foreground/60">
              They get a card on their board and enter with one click — no code
              to pass around, and declining costs them nothing.
            </p>
          </div>
        ) : (
          <p className="border-b border-foreground/10 px-4 py-4 font-sans text-[0.8rem] leading-relaxed text-foreground/60">
            Registration has closed, so there is nothing left to invite anyone to.
          </p>
        )}

        {invitations.length === 0 ? (
          <p className="px-4 py-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground/55">
            Nobody invited yet
          </p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {invitations.map((invitation) => {
              const name =
                invitation.receiver.fullName ??
                (invitation.receiver.handle ? `@${invitation.receiver.handle}` : "Someone");

              return (
                <li
                  key={invitation.id}
                  className="flex items-baseline justify-between gap-3 px-4 py-2.5"
                >
                  <span className="min-w-0 truncate font-sans text-sm text-foreground">
                    {name}
                    {invitation.receiver.handle && invitation.receiver.fullName && (
                      <span className="ml-1.5 font-mono text-[0.55rem] text-foreground/45">
                        @{invitation.receiver.handle}
                      </span>
                    )}
                  </span>
                  {/* Word, not colour. Nothing here is legible from hue alone. */}
                  <span
                    className={`shrink-0 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] ${STATUS_TONE[invitation.status]}`}
                  >
                    {STATUS_LABEL[invitation.status]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </DetailPanel>

      {isPrivate && inviteCode && (
        <DetailPanel title="Invitation code">
          <div className="flex flex-col gap-2 px-4 py-4">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 select-all break-all border border-foreground/20 bg-background px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                {inviteCode}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 cursor-pointer border border-foreground/25 bg-background px-3 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                {codeCopied ? "Copied" : "Copy"}
              </button>
            </div>
            {/* It used to render on the public page, to everyone. Saying what
                it is worth is the difference between a host guarding it and a
                host pasting it into a public Discord. */}
            <p className="font-sans text-[0.78rem] leading-relaxed text-foreground/60">
              Anyone holding this can enter, and anyone you give it to can pass
              it on. Invitations above are the safer way in.
            </p>
          </div>
        </DetailPanel>
      )}

      {canCancel && (
        <DetailPanel title="Call it off">
          <div className="flex flex-col gap-3 px-4 py-4">
            {confirmingCancel ? (
              <>
                <p className="font-sans text-[0.8rem] leading-relaxed text-foreground">
                  Everyone who entered will see this arena marked as called off.
                  It cannot be reopened.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={canceling}
                    onClick={cancelArena}
                    className="cursor-pointer border-2 border-accent bg-accent px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-background transition-all hover:bg-transparent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {canceling ? "…" : "Yes, call it off"}
                  </button>
                  <button
                    type="button"
                    disabled={canceling}
                    onClick={() => setConfirmingCancel(false)}
                    className="cursor-pointer border-b border-transparent px-1 py-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                  >
                    Keep it
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-sans text-[0.8rem] leading-relaxed text-foreground/70">
                  The page stays up and says what happened, so anyone who
                  cleared their Saturday finds out rather than turning up.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="cursor-pointer self-start border border-accent/60 px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-accent transition-colors hover:border-accent hover:bg-accent hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  Call this arena off
                </button>
              </>
            )}
          </div>
        </DetailPanel>
      )}
    </div>
  );
}

export default ArenaHostSections;
