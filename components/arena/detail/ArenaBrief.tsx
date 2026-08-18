import ReactMarkdown from "react-markdown";

/**
 * The brief, as the host wrote it.
 *
 * It is the reason anyone is on this page, so it gets the widest measure and
 * the only body-serif on the screen. The prose styles are the same set the
 * page has always used, moved here so the description and the rules cannot
 * drift apart - they used to be styled in two different components with two
 * different `prose-` chains.
 */
const PROSE = [
  "prose max-w-none font-sans leading-relaxed text-foreground",
  "prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-h3:mb-2",
  "prose-p:font-sans prose-p:text-foreground/85 prose-p:my-3",
  "prose-strong:font-bold prose-strong:text-foreground",
  "prose-code:font-mono prose-code:text-xs prose-code:bg-foreground/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-foreground/20",
  "prose-pre:bg-foreground prose-pre:text-background prose-pre:p-4 prose-pre:border prose-pre:border-foreground",
  "prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5",
  "prose-li:font-sans prose-li:text-sm prose-li:text-foreground/85",
  "prose-a:text-orange-ink prose-a:no-underline hover:prose-a:underline",
  "prose-blockquote:border-l-2 prose-blockquote:border-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground/65",
].join(" ");

export function ArenaBrief({ markdown }: { markdown: string }) {
  return (
    <div className={PROSE}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export default ArenaBrief;
