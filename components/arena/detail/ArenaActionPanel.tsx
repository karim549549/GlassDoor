"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildArenaSlug } from "@/lib/arena-slug";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";
import type { ViewerRelationship } from "@/lib/arena/dto";
import { DetailPanel } from "./panels";

/**
 * The only thing on this page that varies by who is reading it.
 *
 * There were two of these before, rendering simultaneously: `ArenaActionButtons`
 * in the hero and `ArenaActionCard` in the sidebar, each implementing the same
 * seven-branch decision from the same four booleans, each with its own
 * invite-code field. They had already drifted, and a reader on a private arena
 * met two identical code boxes and had to guess which one counted.
 *
 * One panel, one state machine, driven by a `ViewerRelationship` the server
 * derived once. 8 statuses x 4 relationships is 32 combinations; three view
 * components could only ever duplicate them.
 */

const PRIMARY =
  "w-full cursor-pointer border-2 border-orange bg-orange px-4 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const QUIET =
  "w-full cursor-pointer border-b border-transparent px-1 py-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

/** A sentence, not a disabled button with nothing to explain it. */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[0.8rem] leading-relaxed text-foreground/70">{children}</p>
  );
}

export interface ArenaActionPanelProps {
  arenaId: string;
  arenaTitle: string;
  relationship: ViewerRelationship;
  status: string;
  isPrivate: boolean;
  entrantCount: number;
  maxParticipants: number | null;
  isTeam: boolean;
  /**
   * False once the arena has run or been called off. `updateArena` refuses
   * both with a 409 and `/arena/[id]/edit` answers 404, so offering the button
   * anyway is a dead end wearing the page's primary style.
   */
  isEditable: boolean;
}

export function ArenaActionPanel({
  arenaId,
  arenaTitle,
  relationship,
  status,
  isPrivate,
  entrantCount,
  maxParticipants,
  isTeam,
  isEditable,
}: ArenaActionPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");

  const slug = buildArenaSlug(arenaTitle, arenaId);
  const registrationOpen = status === "REGISTRATION_OPEN";
  const isFull = maxParticipants !== null && entrantCount >= maxParticipants;

  const post = async (path: string, body?: unknown, success?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/arena/${arenaId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast(data.error || "That did not work.", "error");
        return;
      }
      if (success) toast(success, "success");
      // Server-rendered page: without this the entrant count and the panel
      // itself keep showing the state from before the click.
      router.refresh();
    } catch (err) {
      logger.error("Arena action failed", {
        arenaId,
        path,
        error: err instanceof Error ? err.message : String(err),
      });
      toast("Network error. Nothing changed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const seats =
    maxParticipants !== null
      ? `${entrantCount} of ${maxParticipants} in`
      : `${entrantCount} in`;

  /* ---------------------------------------------------------------- host */
  if (relationship === "host") {
    return (
      <DetailPanel title="You are running this" accent aside={seats}>
        <div className="flex flex-col gap-3 px-4 py-4">
          {/* No Enter button, ever. A host may run an arena or compete in it,
              not both - the same line `lib/arena/authority.ts` draws for
              judging, for the same reason. */}
          {isEditable && (
            <Link
              href={`/arena/${slug}/edit`}
              className={PRIMARY.replace("w-full", "block w-full text-center")}
            >
              Edit the brief
            </Link>
          )}
          <Note>
            {status === "CANCELED"
              ? "You called this off. The page stays up so anyone who entered can see what happened."
              : !isEditable
                ? "This one has run. The brief is now a record of what was set."
                : registrationOpen || status === "SCHEDULED"
                  ? "Anything that has not happened yet can still change."
                  : "Registration has closed, but the build window is still open."}
          </Note>
        </div>
      </DetailPanel>
    );
  }

  /* ------------------------------------------------------------- entrant */
  if (relationship === "entrant") {
    return (
      <DetailPanel title="You're in" accent aside={seats}>
        <div className="flex flex-col gap-3 px-4 py-4">
          <Note>
            {status === "IMPLEMENTATION_PHASE"
              ? "The build window is open. Ship something."
              : status === "IDEA_PHASE"
                ? "Planning time. Decide what you are making before the clock starts."
                : registrationOpen
                  ? "Your seat is held. Nothing else to do until it starts."
                  : "Entries are closed. See you at the demo."}
          </Note>

          {registrationOpen && (
            <button
              type="button"
              disabled={busy}
              onClick={() => post("leave", undefined, "You have left this arena.")}
              className={QUIET}
            >
              {busy ? "…" : "Leave this arena"}
            </button>
          )}
        </div>
      </DetailPanel>
    );
  }

  /* --------------------------------------------------------------- guest */
  if (relationship === "guest") {
    return (
      <DetailPanel title="Want in?" accent aside={seats}>
        <div className="flex flex-col gap-3 px-4 py-4">
          <Link
            href={`/login?redirectTo=${encodeURIComponent(`/arena/${slug}`)}`}
            className={PRIMARY.replace("w-full", "block w-full text-center")}
          >
            Sign in to enter
          </Link>
          <Note>Free, and takes a code from your inbox. No CV, no cover letter.</Note>
        </div>
      </DetailPanel>
    );
  }

  /* ------------------------------------------------------------- visitor */
  if (!registrationOpen) {
    return (
      <DetailPanel title="Entries" aside={seats}>
        <div className="px-4 py-4">
          <Note>
            {status === "SCHEDULED"
              ? "Registration has not opened yet. Come back when it does."
              : status === "CANCELED"
                ? "This one was called off."
                : "Entries closed. The board has the ones you can still get into."}
          </Note>
        </div>
      </DetailPanel>
    );
  }

  if (isFull) {
    return (
      <DetailPanel title="Entries" aside={seats}>
        <div className="px-4 py-4">
          <Note>This arena is full.</Note>
        </div>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel title="Want in?" accent aside={seats}>
      <div className="flex flex-col gap-3 px-4 py-4">
        {isPrivate ? (
          <>
            {/* The code, for someone who was handed one. Anyone actually
                invited has already entered from the invitation itself and
                never sees this field. */}
            <label
              htmlFor="arena-invite-code"
              className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-foreground/50"
            >
              Invitation code
            </label>
            <input
              id="arena-invite-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full border border-foreground/25 bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            />
            <button
              type="button"
              disabled={busy || code.trim().length === 0}
              onClick={() => post("join", { inviteCode: code.trim() }, `You're in: ${arenaTitle}`)}
              className={PRIMARY}
            >
              {busy ? "…" : "Enter with code"}
            </button>
            <Note>Invite only. Ask whoever told you about it for the code.</Note>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => post("join", undefined, `You're in: ${arenaTitle}`)}
              className={PRIMARY}
            >
              {busy ? "…" : "Enter this arena"}
            </button>
            <Note>
              {isTeam
                ? "Free to enter. Teams form once you are in."
                : "Free to enter. Solo, and you can leave any time before it starts."}
            </Note>
          </>
        )}
      </div>
    </DetailPanel>
  );
}

export default ArenaActionPanel;
