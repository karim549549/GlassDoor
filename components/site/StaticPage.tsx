import Link from "next/link";

/**
 * Shell for the standing pages the footer links to - about, support, terms,
 * privacy. They share one layout so a reader moving between them is not
 * relearning the page each time, and so the footer never points at a route that
 * renders differently from its neighbours.
 */
export function StaticPage({
  eyebrow,
  title,
  standfirst,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
  /** Shown on documents where currency matters. Omit elsewhere. */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-20 md:py-28">
        <Link
          href="/"
          className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground hover:text-orange transition-colors"
        >
          &larr; Devs Arena
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
            {eyebrow}
          </span>
          <h1 className="font-display italic text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] uppercase mt-3">
            {title}
          </h1>
          <p className="text-[0.95rem] leading-relaxed text-foreground/70 mt-5 max-w-xl">
            {standfirst}
          </p>
          {updated && (
            <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground mt-5">
              Last updated {updated}
            </p>
          )}
        </header>

        <div className="mt-10 space-y-9">{children}</div>
      </div>
    </main>
  );
}

/** One titled block of prose. Keeps heading rhythm identical across pages. */
export function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-orange">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[0.9rem] leading-relaxed text-foreground/75">
        {children}
      </div>
    </section>
  );
}

/**
 * Marks a document as not yet reviewed by a lawyer.
 *
 * Deliberately prominent rather than a footnote. Publishing invented terms or a
 * privacy policy that misdescribes what the product actually collects is worse
 * than publishing nothing - it is a representation to users and a regulator can
 * read it. These drafts describe the real behaviour of the app so they are a
 * useful starting point, but they are a starting point.
 */
export function DraftNotice() {
  return (
    <div className="border-2 border-accent bg-accent/5 px-5 py-4">
      <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em] text-accent">
        Draft &mdash; not yet reviewed by a lawyer
      </p>
      <p className="text-[0.85rem] leading-relaxed text-foreground/75 mt-2">
        This document describes how Devs Arena actually works today, but it has
        not been through legal review and is not a substitute for advice. It must
        be reviewed before the platform accepts signups or payments.
      </p>
    </div>
  );
}

export default StaticPage;
