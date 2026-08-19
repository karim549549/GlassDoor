"use client";

import { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { useSiteSearch, type SearchHit } from "@/lib/client/useSiteSearch";

/**
 * Find someone, invite them.
 *
 * Deliberately NOT the nav search dialog, even though it searches the same
 * people. That one is a navigation surface: picking a result takes you
 * somewhere, it is opened from anywhere by Cmd+K, and it has no idea which
 * arena you were looking at. Teaching it a second mode would mean one control
 * that navigates or invites depending on how it was opened, with nothing on
 * screen to say which - and threading an arena id into a global singleton to
 * make it work.
 *
 * What is shared is the search itself: `/api/search?only=people` and
 * `useSiteSearch`, so there is one definition of how a person is found and one
 * place the result shape lives.
 *
 * Searching rather than typing a handle also fixes a real hole. Most people
 * here have never set a handle, so the handle field could not name them at
 * all; search matches on full name and hands back an id.
 */

export interface InvitePeopleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arenaTitle: string;
  /** Invites one person. Resolves to an error message, or null on success. */
  onInvite: (person: { userId: string; name: string }) => Promise<string | null>;
  /** Already invited, so the row says so instead of offering a button that fails. */
  invitedIds: string[];
  /**
   * Removed from the results entirely - the host themself. Distinct from
   * `invitedIds`: "Invited" beside your own name would be a lie, and an
   * Invite button there is an action that can never succeed.
   *
   * People who have already *entered* cannot be filtered here: the detail DTO
   * deliberately ships no participant user ids, so the page has none to pass.
   * The API refuses them and the dialog shows why, which is the right failure
   * to keep.
   */
  hiddenIds: string[];
}

export function InvitePeopleDialog({
  open,
  onOpenChange,
  arenaTitle,
  onInvite,
  invitedIds,
  hiddenIds,
}: InvitePeopleDialogProps) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [invited, setInvited] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebouncedValue(query, 250);
  const { groups, loading, failed } = useSiteSearch(open ? debounced : "", {
    only: "people",
  });

  const hidden = new Set(hiddenIds);
  const people = (groups.find((g) => g.key === "people")?.hits ?? []).filter(
    (hit) => !hidden.has(hit.id)
  );
  const alreadyInvited = new Set([...invitedIds, ...invited]);

  const invite = async (hit: SearchHit) => {
    setBusyId(hit.id);
    setError(null);
    try {
      const message = await onInvite({ userId: hit.id, name: hit.title });
      if (message) {
        setError(message);
        return;
      }
      // The dialog stays open. Inviting one person is usually inviting three,
      // and closing after each would make the second one a fresh search.
      setInvited((prev) => [...prev, hit.id]);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuery("");
          setError(null);
          setInvited([]);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-xl rounded-none border-2 border-foreground bg-background p-0 shadow-[6px_6px_0_0_var(--foreground)] sm:max-w-xl"
      >
        <div className="border-b-2 border-orange bg-foreground px-6 py-4">
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.28em] text-orange">
            Invite to
          </span>
          <h2 className="mt-1.5 font-display text-2xl italic leading-tight text-background">
            {arenaTitle}
          </h2>
        </div>

        <div className="px-6 pt-5">
          <label htmlFor="invite-search" className="sr-only">
            Search people by name or handle
          </label>
          <div className="flex items-center gap-2 border border-foreground/25 bg-card px-3 focus-within:border-foreground">
            <Search aria-hidden className="h-4 w-4 shrink-0 text-foreground/45" />
            <input
              id="invite-search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or @handle"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-none"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mx-6 mt-3 border-l-2 border-accent bg-card px-3 py-2 font-sans text-[0.8rem] leading-relaxed text-foreground"
          >
            {error}
          </p>
        )}

        {/* A fixed height, like the nav dialog: a panel that grows and shrinks
            between keystrokes resizes under the reader's cursor. */}
        <div className="mt-4 h-72 overflow-y-auto border-t border-foreground/12">
          {query.trim().length < 2 ? (
            <p className="px-6 py-6 font-sans text-sm leading-relaxed text-foreground/60">
              Type a name or a handle. They get a card on their board and enter
              with one click — no code to pass around.
            </p>
          ) : loading ? (
            <p className="px-6 py-6 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground/55">
              Searching…
            </p>
          ) : failed ? (
            <p className="px-6 py-6 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-accent">
              Search is not answering. Try again.
            </p>
          ) : people.length === 0 ? (
            <p className="px-6 py-6 font-sans text-sm leading-relaxed text-foreground/60">
              Nobody here by that name.
            </p>
          ) : (
            <ul className="divide-y divide-foreground/10">
              {people.map((hit) => {
                const done = alreadyInvited.has(hit.id);
                const busy = busyId === hit.id;

                return (
                  <li key={hit.id} className="flex items-center gap-3 px-6 py-3">
                    {hit.imageUrl ? (
                      <Image
                        src={hit.imageUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 border border-foreground/15 object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center border border-foreground/15 bg-secondary font-mono text-[0.65rem] font-bold uppercase text-foreground/60"
                      >
                        {hit.title.replace(/^@/, "").charAt(0)}
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sans text-sm font-semibold text-foreground">
                        {hit.title}
                      </span>
                      {hit.subtitle && (
                        <span className="block truncate font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground/55">
                          {hit.subtitle}
                        </span>
                      )}
                    </span>

                    {done ? (
                      // A word, not a greyed-out button: "why can't I click
                      // this" is a question the row should answer itself.
                      <span className="shrink-0 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-orange-ink">
                        Invited
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => invite(hit)}
                        className="shrink-0 cursor-pointer border-2 border-foreground bg-foreground px-3.5 py-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-background transition-all hover:bg-transparent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                      >
                        {busy ? "…" : "Invite"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-foreground/12 px-6 py-3">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground/55">
            {invited.length > 0
              ? `${invited.length} invited`
              : "Declining costs them nothing"}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border border-foreground/25 bg-background px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InvitePeopleDialog;
