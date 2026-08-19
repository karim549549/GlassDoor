"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * The one irreversible thing a host can do on this page, behind a real modal.
 *
 * It used to be an inline two-step: the button swapped itself for a sentence
 * and two more buttons in the same panel. That is a weak confirmation - the
 * destructive control ends up roughly where the reader's cursor already is,
 * and nothing about the page changes to say a decision is being made. A modal
 * takes focus, traps it, and puts the consequence in front of the button
 * instead of beside it.
 *
 * Cancelling an arena cannot be undone: `cancelArena` sets `canceledAt` and
 * there is no path that clears it, by design - people who cleared their
 * Saturday were told it was off.
 */
export function CancelArenaDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
  arenaTitle,
  entrantCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy: boolean;
  arenaTitle: string;
  /** Named in the copy, because it is the number that makes this consequential. */
  entrantCount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg rounded-none border-2 border-foreground bg-background p-0 shadow-[6px_6px_0_0_var(--foreground)] sm:max-w-lg"
      >
        <div className="border-b-2 border-accent bg-foreground px-6 py-4">
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.28em] text-accent">
            Cannot be undone
          </span>
          <h2 className="mt-2 font-display text-2xl italic leading-tight text-background">
            Call off this arena?
          </h2>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="font-sans text-sm leading-relaxed text-foreground">
            <span className="font-semibold">{arenaTitle}</span> will be marked as
            called off.{" "}
            {entrantCount > 0
              ? `${entrantCount} ${entrantCount === 1 ? "person has" : "people have"} entered and will see it on the page.`
              : "Nobody has entered yet."}
          </p>

          <p className="font-sans text-sm leading-relaxed text-foreground/70">
            The page stays up saying what happened, so anyone who cleared their
            Saturday finds out rather than turning up. There is no way to
            reopen it.
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="cursor-pointer border-2 border-accent bg-accent px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-background shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {busy ? "Calling it off…" : "Yes, call it off"}
            </button>

            {/* The safe choice is the plain one. A cancel styled to match the
                destructive button is how someone confirms by muscle memory. */}
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer border-b border-transparent px-1 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              Keep it running
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CancelArenaDialog;
