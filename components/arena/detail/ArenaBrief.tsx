import ReactMarkdown from "react-markdown";

/**
 * The brief, set as writing rather than as a field.
 *
 * It used to share a `prose` chain with the house rules at one size, which
 * meant a one-sentence brief - which most of them are - arrived as a line of
 * default body text under a label. Nothing was wrong with it and nothing about
 * it said "this is the thing you came to read".
 *
 * It now opens with a standfirst: the first paragraph in the display serif,
 * roman rather than the italic the title uses, at a size no body text on the
 * site reaches. That is the newspaper arrangement - italic display for the
 * headline, roman display for the sentence under it - and it gives a
 * single-sentence brief the weight it should always have had. Anything after
 * it drops to body size, so a long brief still reads as prose.
 *
 * The rules are no longer rendered here at all. They are a `String[]` column
 * and the page draws them as a numbered list, because they were never prose:
 * every arena filled that field with a run of short sentences, and setting
 * them as a paragraph made three separate rules read as one.
 */
const BRIEF = [
  "prose max-w-none font-sans text-foreground",
  "prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h2:text-xl prose-h3:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2",
  "prose-strong:font-bold prose-strong:text-foreground",
  "prose-code:font-mono prose-code:text-[0.85em] prose-code:bg-foreground/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-foreground/20 prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-foreground prose-pre:text-background prose-pre:p-4 prose-pre:border prose-pre:border-foreground prose-pre:rounded-none",
  "prose-a:text-orange-ink prose-a:underline prose-a:underline-offset-2 prose-a:decoration-orange/40 hover:prose-a:decoration-orange",
  "prose-blockquote:border-l-2 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-foreground/70",
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
  "[&>*:last-child]:mb-0",
].join(" ");

export function ArenaBrief({ markdown }: { markdown: string }) {
  return (
    <div className={BRIEF}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export default ArenaBrief;
