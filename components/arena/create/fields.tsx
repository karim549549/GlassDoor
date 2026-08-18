"use client";

import React, { useId } from "react";

/**
 * The vocabulary the create page is built from.
 *
 * Kept in one file because these are five small pieces of a single visual
 * idea rather than five independent components - they share the label
 * treatment, the hairline, and the focus behaviour, and splitting them across
 * five files would mean editing five files to change one rule.
 *
 * The idea: no boxes. The previous page put every field inside a
 * `border-2 + shadow-[4px_4px]` card, which gave "minimum team size" the same
 * visual weight as the brief itself. Here a field is a label, a hairline, and
 * the value - and emphasis comes from type size, so the brief can be enormous
 * and the team cap can be small without either needing a container.
 */

/* ------------------------------------------------------------------ label */

interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Renders as a <span> for groups where no single input owns the label. */
  as?: "label" | "span";
}

export function FieldLabel({ htmlFor, children, hint, error, as = "label" }: FieldLabelProps) {
  const Tag = as;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Tag
        htmlFor={as === "label" ? htmlFor : undefined}
        className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-foreground"
      >
        {children}
      </Tag>
      {error ? (
        <span className="font-mono text-[0.55rem] uppercase tracking-wider text-accent">{error}</span>
      ) : hint ? (
        <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- field */

/** Label + hairline-underlined control, the default shape for everything. */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className = "",
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <FieldLabel htmlFor={htmlFor} hint={hint} error={error}>
        {label}
      </FieldLabel>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ inputs */

/**
 * A filled surface, not a bare underline.
 *
 * The first pass underlined inputs and left them transparent on the cream
 * ground. It looked clean and it was unusable: with no boxes anywhere, nothing
 * distinguished a place to type from a line of prose. An input's first job is
 * to look like an input.
 *
 * `--secondary` (#E4E1D9) against the `--card` panel behind it is the pairing
 * the profile and auth forms already use, so this reads as the same app rather
 * than as a new idea.
 */
const LINE_INPUT =
  "w-full bg-secondary border border-foreground/15 px-3 py-2.5 " +
  "font-sans text-[0.95rem] text-foreground placeholder:text-muted-foreground/70 " +
  "focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors " +
  "disabled:opacity-50";

export const LineInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function LineInput({ className = "", invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`${LINE_INPUT} ${invalid ? "border-accent" : ""} ${className}`}
      {...props}
    />
  );
});

export const LineTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function LineTextarea({ className = "", invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`${LINE_INPUT} resize-y leading-relaxed ${invalid ? "border-accent" : ""} ${className}`}
      {...props}
    />
  );
});

/* ------------------------------------------------------------- step panel */

/**
 * One bordered surface per step.
 *
 * The page this replaced gave each of seven sections its own
 * `border-2 + shadow-[4px_4px]` card, so "minimum team size" was framed as
 * heavily as the brief itself. Removing them entirely went too far the other
 * way: a full page of cream reads as an article, and it stops being obvious
 * which parts are for writing in. One panel per step is the middle - the form
 * has edges, and emphasis inside it still comes from type.
 */
export function StepPanel({
  index,
  title,
  lead,
  children,
}: {
  index: number;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-foreground/15 bg-card p-6 md:p-10">
      <header className="mb-8 flex flex-col gap-2 border-b border-foreground/10 pb-5">
        <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.22em] text-orange-ink">
          {String(index).padStart(2, "0")} / {title}
        </span>
        {lead && (
          <p className="max-w-[60ch] font-sans text-sm leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

/* ------------------------------------------------------- segmented choice */

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  /** Second line, for options whose name does not explain them. */
  detail?: string;
}

/**
 * A row of square hairline buttons, one selected.
 *
 * Radio inputs rather than buttons: arrow keys move between options, the
 * group is announced as a group, and the browser handles the roving tabindex
 * that a div of buttons would have to reimplement badly.
 */
export function SegmentedChoice<T extends string>({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  name,
  columns,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (next: T) => void;
  name: string;
  /** Force a grid; otherwise the options flow in one row on wide screens. */
  columns?: number;
}) {
  const groupId = useId();

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
      <legend className="contents">
        <FieldLabel as="span" hint={hint} error={error}>
          {label}
        </FieldLabel>
      </legend>

      <div
        className="grid gap-px bg-foreground/15 border border-foreground/15"
        style={{
          gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const id = `${groupId}-${option.value}`;
          const selected = value === option.value;

          return (
            <div key={option.value} className="relative">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={[
                  "flex h-full cursor-pointer flex-col justify-center gap-1 px-3 py-3 text-center transition-colors",
                  // The accessible pair from globals.css: orange fill takes
                  // dark ink, never white - #E05E18 with white text is 3.16:1.
                  selected
                    ? "bg-orange text-[#0E0E0D]"
                    : "bg-card text-foreground hover:bg-foreground/5",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-foreground",
                ].join(" ")}
              >
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em]">
                  {option.label}
                </span>
                {option.detail && (
                  <span
                    className={`font-mono text-[0.5rem] uppercase tracking-wider ${
                      selected ? "text-[#0E0E0D]/70" : "text-muted-foreground"
                    }`}
                  >
                    {option.detail}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ toggle */

/**
 * A two-state switch that says what each state means.
 *
 * Built on SegmentedChoice rather than a checkbox because "Anyone can enter"
 * next to "Invite only" states both outcomes; a lone checkbox labelled
 * "Private" makes the reader infer the unchecked one.
 */
export function BinaryChoice({
  label,
  hint,
  name,
  value,
  onChange,
  offLabel,
  onLabel,
  offDetail,
  onDetail,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  name: string;
  value: boolean;
  onChange: (next: boolean) => void;
  offLabel: string;
  onLabel: string;
  offDetail?: string;
  onDetail?: string;
}) {
  return (
    <SegmentedChoice<"off" | "on">
      label={label}
      hint={hint}
      name={name}
      value={value ? "on" : "off"}
      onChange={(next) => onChange(next === "on")}
      options={[
        { value: "off", label: offLabel, detail: offDetail },
        { value: "on", label: onLabel, detail: onDetail },
      ]}
    />
  );
}
