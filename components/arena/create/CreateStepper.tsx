"use client";

export interface CreateStep {
  id: string;
  /** "The brief", "What kind" - sentence case, not a system label. */
  label: string;
  complete: boolean;
}

/**
 * Six numbered steps on a hairline, replacing the dark masthead and the
 * "[PROGRESS REGISTER HUD]" checklist that used to sit in the right rail.
 *
 * Navigation and progress in one control rather than two. The old page had a
 * separate panel listing the same five sections with strikethrough - so
 * knowing where you were and knowing what was left were two different places
 * to look, and neither took you anywhere.
 *
 * Free navigation, not a wizard: a host filling this in wants to jump to the
 * clock, not walk through five screens to reach it. The completion marker is
 * information, never a lock.
 */
export function CreateStepper({
  steps,
  activeId,
  onSelect,
}: {
  steps: readonly CreateStep[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Arena setup steps" className="border-b border-foreground/15">
      <ol className="flex flex-wrap items-stretch gap-x-6 gap-y-1 md:gap-x-8">
        {steps.map((step, index) => {
          const active = step.id === activeId;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                className={[
                  "group flex items-baseline gap-2 border-b-2 py-3 transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                  active
                    ? "border-orange text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <span
                  className={`font-mono text-[0.6rem] font-bold tabular-nums tracking-[0.14em] ${
                    active ? "text-orange-ink" : ""
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em]">
                  {step.label}
                </span>
                {/* Completion never relies on colour alone - the marker is a
                    filled square against a hollow one, and it carries text for
                    a screen reader. */}
                <span
                  aria-hidden
                  className={`ml-0.5 h-1.5 w-1.5 shrink-0 self-center border ${
                    step.complete
                      ? "border-orange-ink bg-orange-ink"
                      : "border-foreground/30 bg-transparent"
                  }`}
                />
                <span className="sr-only">{step.complete ? " (complete)" : " (incomplete)"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default CreateStepper;
