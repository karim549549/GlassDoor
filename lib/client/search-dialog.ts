"use client";

/**
 * One search dialog, openable from anywhere.
 *
 * The board had its own text input filtering the list in place while the nav
 * had a dialog that searched arenas - two searches with different scopes and
 * different results for the same words. There is one now, and anything that
 * wants it calls `openSearchDialog()`.
 *
 * A module-level listener set rather than context: the opener (a field in the
 * board's filter bar) and the dialog (in the nav) sit in different subtrees
 * with no useful common ancestor below the root layout, and threading a
 * provider through the whole app to carry one boolean would be a lot of
 * plumbing for an event.
 */

type Listener = (initialQuery: string) => void;

const listeners = new Set<Listener>();

/** Opens the dialog, optionally seeded with text the reader already typed. */
export function openSearchDialog(initialQuery = "") {
  listeners.forEach((notify) => notify(initialQuery));
}

export function onOpenSearchDialog(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
