"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "devsarena.create.first-run-dismissed";

/**
 * `localStorage` read through useSyncExternalStore rather than an effect.
 *
 * The obvious build - `useState(false)` plus an effect that reads storage and
 * calls `setVisible(true)` - is a setState inside an effect, which schedules a
 * second render pass on every mount and is what the lint rule in this repo
 * exists to catch. This is the shape React added for exactly this case: a
 * server snapshot of "dismissed" so nothing renders during SSR, a client
 * snapshot read from storage, and a subscription so a dismissal repaints
 * without any state of its own.
 *
 * The `storage` event only fires in *other* tabs, so local dismissals notify
 * through a listener set of our own.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function isDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private mode, or storage disabled. Showing the note every time is a
    // better failure than throwing on a hint.
    return false;
  }
}

/** On the server there is no storage, so render nothing rather than guess. */
function isDismissedOnServer(): boolean {
  return true;
}

function dismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // It will show again next time, which is harmless.
  }
  listeners.forEach((notify) => notify());
}

/**
 * One line for a first-time host, instead of a tour.
 *
 * A coach-mark tour was the obvious answer and is the wrong one here. Every
 * step on this page already carries a lead line, every field a label and a
 * hint, and the placeholders are worked examples - so a tour would mostly
 * re-read that text through a dark overlay, after making someone wait to type.
 * It is also the most expensive thing to keep working: spotlight anchoring,
 * focus trapping and responsive re-positioning all break whenever the layout
 * moves, and most people dismiss it within two seconds anyway.
 *
 * The people who need a tour are the ones who do not know what an arena is,
 * and they are on /about - upstream of here. Anyone who reached this page has
 * already decided to run one.
 */
export function FirstRunNote() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer);

  if (dismissed) return null;

  return (
    <div className="field-in mb-6 flex items-start gap-4 border border-orange/40 bg-orange/10 px-4 py-3">
      <p className="min-w-0 flex-1 font-sans text-sm leading-relaxed text-foreground">
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-orange-ink">
          First one?{" "}
        </span>
        The clock, the team size and the rest are already set for next Saturday
        &mdash; change anything you like. All you have to write is the brief.
        Steps can be visited in any order.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss this note"
        className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default FirstRunNote;
