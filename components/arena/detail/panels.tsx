import React from "react";

/**
 * The detail page's panel chrome, matching the board's rail and the create
 * form's step panels.
 *
 * The page this replaces used `bg-white`, `border-2 border-foreground` and
 * `shadow-[6px_6px_0px_0px_var(--foreground)]` on every surface, plus a raw
 * `#FF5722` that is not the palette orange - a design language nothing else on
 * the site had used since the board and the create form were rebuilt. One
 * hairline on `bg-card`, mono uppercase micro-label, square corners.
 */
export function DetailPanel({
  title,
  accent,
  aside,
  children,
}: {
  title: string;
  /** Orange label, for the one panel on a surface that should be looked at first. */
  accent?: boolean;
  /** A short right-aligned note in the header - a count, a status word. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-foreground/15 bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-foreground/12 px-4 py-2.5">
        <h2
          className={`font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] ${
            accent ? "text-orange-ink" : "text-foreground/70"
          }`}
        >
          {title}
        </h2>
        {aside && (
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] tabular-nums text-foreground/55">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * One labelled fact. The label is the quiet half and the value is the loud
 * one, which is the opposite of how this page used to set them.
 */
export function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-foreground/50">
        {label}
      </span>
      <span className="font-sans text-sm leading-snug text-foreground">{children}</span>
    </div>
  );
}

export function FactList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-foreground/10">{children}</div>;
}

/**
 * The tier badge, in the two cases where it says something.
 *
 * COMMUNITY is deliberately unbadged: it is the default and the great majority,
 * so a badge on it is ink spent telling the reader something they already know.
 * OFFICIAL and COMPANY carry real consequences - full XP and prize eligibility,
 * where COMMUNITY gets neither - so those are worth the space. Same rule and
 * the same two treatments as `ArenaRow`.
 */
export function authorityBadge(
  authority: string
): { label: string; className: string } | null {
  if (authority === "OFFICIAL") {
    return { label: "Official", className: "border-orange bg-orange text-[#0E0E0D]" };
  }
  if (authority === "COMPANY") {
    return { label: "Company", className: "border-background bg-background text-foreground" };
  }
  return null;
}

/** How each derived status reads to someone who is not a developer. */
export const STATUS_COPY: Record<string, { label: string; tone: "live" | "open" | "past" }> = {
  DRAFT: { label: "Not published", tone: "past" },
  SCHEDULED: { label: "Opens soon", tone: "open" },
  REGISTRATION_OPEN: { label: "Open to enter", tone: "open" },
  IDEA_PHASE: { label: "Planning now", tone: "live" },
  IMPLEMENTATION_PHASE: { label: "Being built now", tone: "live" },
  UNDER_JUDGING: { label: "Being judged", tone: "past" },
  COMPLETED: { label: "Finished", tone: "past" },
  CANCELED: { label: "Called off", tone: "past" },
};
