"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/ToastProvider";
import { logger } from "@/lib/client/logger";

/**
 * Start a team, which is how you enter a team arena.
 *
 * `POST /api/arena/[id]/teams` has existed since teams did and had no caller:
 * the detail page's only team affordance was a link to `/arena/[slug]/teams`,
 * a route that never existed. So a team arena could be entered — as a solo
 * entry — and could never actually form a team.
 *
 * The name is the only field, and it is the fun one. It is what the lobby
 * shows, it is what people shout at the demo, and asking for anything else at
 * this moment would turn joining your friends into a form.
 */
export function StartTeamDialog({
  open,
  onOpenChange,
  arenaId,
  arenaTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arenaId: string;
  arenaTitle: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Give it a name — at least two characters.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/arena/${arenaId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Could not start that team.");
        return;
      }

      toast(`${trimmed} is in. Now find some people.`, "success");
      onOpenChange(false);
      setName("");
      router.refresh();
    } catch (err) {
      logger.error("Create team failed", {
        arenaId,
        error: err instanceof Error ? err.message : String(err),
      });
      setError("Network error. Nothing was created.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setError(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-none border-2 border-foreground bg-background p-0 shadow-[6px_6px_0_0_var(--foreground)] sm:max-w-md"
      >
        <div className="border-b-2 border-orange bg-foreground px-6 py-4">
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.28em] text-orange">
            Start a team
          </span>
          <h2 className="mt-1.5 font-display text-2xl italic leading-tight text-background">
            {arenaTitle}
          </h2>
        </div>

        <div className="flex flex-col gap-3 px-6 py-5">
          <label
            htmlFor="team-name"
            className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-foreground/50"
          >
            Team name
          </label>
          <input
            id="team-name"
            autoFocus
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="Slow Loris"
            autoComplete="off"
            className="w-full border border-foreground/25 bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/35 focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          />

          {error && (
            <p role="alert" className="font-sans text-[0.8rem] leading-relaxed text-accent">
              {error}
            </p>
          )}

          <p className="font-sans text-[0.78rem] leading-relaxed text-foreground/60">
            You lead it, and it shows up in the lobby with your seats open.
            Anyone who wants in can take one.
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="cursor-pointer border-2 border-orange bg-orange px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {busy ? "Starting…" : "Start the team"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer border-b border-transparent px-1 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              Not yet
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StartTeamDialog;
