import ReactMarkdown from "react-markdown";

/**
 * The brief, and the rules, set as two different kinds of writing.
 *
 * Both used to render through one `prose` chain at one size, which meant a
 * one-sentence brief - which most of them are - arrived as a line of default
 * body text under a label. Nothing was wrong with it and nothing about it said
 * "this is the thing you came to read".
 *
 * They are not the same kind of text and they now do not look it:
 *
 *   The **brief** opens with a standfirst. The first paragraph is set in the
 *   display serif, roman rather than the italic the title uses, at a size no
 *   body text on the site reaches. That is the newspaper arrangement - italic
 *   display for the headline, roman display for the sentence under it - and it
 *   gives a single-sentence brief the weight it should always have had.
 *   Anything after it drops to body size, so a long brief still reads as
 *   prose.
 *
 *   The **rules** are reference, not prose. Smaller, tighter, with markers on
 *   the list items. Nobody reads house rules top to bottom; they check them.
 *
 * The contrast between the two is the point. One voice for both was the
 * problem.
 */

/** Shared inline styling: links, code, emphasis. Identical in both variants. */
const INLINE = [
  "prose max-w-none font-sans text-foreground",
  "prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-strong:font-bold prose-strong:text-foreground",
  "prose-code:font-mono prose-code:text-[0.85em] prose-code:bg-foreground/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-foreground/20 prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-foreground prose-pre:text-background prose-pre:p-4 prose-pre:border prose-pre:border-foreground prose-pre:rounded-none",
  "prose-a:text-orange-ink prose-a:underline prose-a:underline-offset-2 prose-a:decoration-orange/40 hover:prose-a:decoration-orange",
  "prose-blockquote:border-l-2 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-foreground/70",
].join(" ");

const BRIEF = [
  INLINE,
  "prose-h2:text-xl prose-h3:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2",
  // The standfirst. `first-of-type` rather than `first-child` so a brief that
  // opens with a heading still gets it on its first actual paragraph.
  "[&>p:first-of-type]:font-display [&>p:first-of-type]:not-italic",
  "[&>p:first-of-type]:text-[clamp(1.25rem,2.4vw,1.6rem)]",
  "[&>p:first-of-type]:leading-[1.35] [&>p:first-of-type]:text-foreground",
  "[&>p:first-of-type]:mt-0 [&>p:first-of-type]:mb-5",
  // Everything after it is ordinary prose again.
  "[&>p:not(:first-of-type)]:font-sans [&>p:not(:first-of-type)]:text-[0.98rem]",
  "[&>p:not(:first-of-type)]:leading-[1.75] [&>p:not(:first-of-type)]:text-foreground/85",
  "prose-li:font-sans prose-li:text-[0.95rem] prose-li:leading-[1.7] prose-li:text-foreground/85",
  "prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5",
].join(" ");

const RULES = [
  INLINE,
  "prose-h2:text-base prose-h3:text-sm prose-h2:mt-5 prose-h2:mb-2 prose-h3:mt-4 prose-h3:mb-1",
  "prose-p:text-[0.9rem] prose-p:leading-[1.7] prose-p:text-foreground/85 prose-p:my-2.5",
  // Variant order matters: `first:prose-p:` would key off the wrapper being
  // a first child, which is not the question. This targets the paragraph.
  "[&>p:first-of-type]:mt-0 [&>*:last-child]:mb-0",
  // Square markers in the accent - the same utilitarian register as the
  // "[✓]" the rest of this codebase uses.
  "prose-ul:list-none prose-ul:pl-0 prose-ul:my-2",
  "prose-li:relative prose-li:pl-5 prose-li:text-[0.9rem] prose-li:leading-[1.7] prose-li:text-foreground/85 prose-li:my-1",
  "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-0",
  "[&_ul>li]:before:content-['—'] [&_ul>li]:before:font-mono [&_ul>li]:before:text-orange-ink",
  "prose-ol:pl-5 prose-ol:my-2",
].join(" ");

export function ArenaBrief({
  markdown,
  variant = "brief",
}: {
  markdown: string;
  /** `brief` opens with a standfirst; `rules` is reference text. */
  variant?: "brief" | "rules";
}) {
  return (
    <div className={variant === "rules" ? RULES : BRIEF}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export default ArenaBrief;
