import React from "react";
import Link from "next/link";
import { DocIndex, type DocSection } from "./DocIndex";

/**
 * Shell for the standing pages the footer links to - about, support, terms,
 * privacy. They share one layout so a reader moving between them is not
 * relearning the page each time, and so the footer never points at a route that
 * renders differently from its neighbours.
 *
 * Now a two-column document: a sticky section index on the left, prose on the
 * right. Previously a single `max-w-3xl` column, which on a wide screen left
 * most of the viewport empty and gave a reader no way to see a document's shape
 * or jump within it - the thing every documentation site provides because
 * everyone relies on it.
 *
 * The index is built from the children rather than passed in. `Block` carries
 * its own heading, so `React.Children` can read them straight off the elements:
 * one source for the heading, the id and the index entry, and no way for a page
 * to list a section it does not render or omit one it does.
 */

/** Heading text to anchor id. Shared so a Block and its index entry cannot drift. */
export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reads the headings off any <Block> children, in render order. */
function collectSections(children: React.ReactNode): DocSection[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    const props = child.props as { heading?: unknown };
    if (typeof props.heading !== "string" || !props.heading) return [];
    return [{ id: slugifyHeading(props.heading), label: props.heading }];
  });
}

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
  const sections = collectSections(children);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
        <Link
          href="/"
          className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground hover:text-orange-ink transition-colors"
        >
          &larr; Devs Arena
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange-ink">
            {eyebrow}
          </span>
          <h1 className="font-display italic text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] uppercase mt-3 text-balance">
            {title}
          </h1>
          <p className="text-[1rem] leading-relaxed text-foreground/70 mt-5 max-w-2xl">
            {standfirst}
          </p>
          {updated && (
            <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground mt-5">
              Last updated {updated}
            </p>
          )}
        </header>

        {/* Index left, prose right. The prose column is capped near 68
            characters rather than filling the remaining space - a full-width
            line of body text is harder to read, so the width freed here buys
            navigation instead of longer lines. */}
        <div className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
          <aside className="md:order-first">
            <DocIndex sections={sections} />
          </aside>

          <div className="min-w-0 max-w-[68ch] space-y-10">{children}</div>
        </div>
      </div>
    </main>
  );
}

/**
 * One titled block of prose. Keeps heading rhythm identical across pages, and
 * carries the anchor the index links to.
 */
export function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  const id = slugifyHeading(heading);
  return (
    // scroll-mt keeps the heading clear of the fixed nav when jumped to.
    // tabIndex -1 makes the section a focus target so the index can move focus
    // here, not just the viewport - otherwise a keyboard user's next Tab
    // continues from wherever they were, which is the classic broken
    // skip-link-style jump. outline-none because focus arrives programmatically
    // from a link the user already sees highlighted.
    <section id={id} tabIndex={-1} className="scroll-mt-28 outline-none">
      <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-orange-ink">
        <a href={`#${id}`} className="hover:underline">
          {heading}
        </a>
      </h2>
      <div className="mt-3 space-y-3 text-[0.92rem] leading-relaxed text-foreground/75">
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
