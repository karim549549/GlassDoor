"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRecentSearches } from "@/lib/client/useRecentSearches";
import { useDebouncedValue } from "@/lib/client/useDebouncedValue";
import { useSiteSearch, type SearchHit } from "@/lib/client/useSiteSearch";
import { onOpenSearchDialog } from "@/lib/client/search-dialog";
import { NavSearchRecent } from "./NavSearchRecent";
import { NavSearchResults } from "./NavSearchResults";

/**
 * The site's only search.
 *
 * It was arenas-only and reachable from one place, while the board carried a
 * second text field of its own that filtered the list in place - two searches
 * with different scopes returning different things for the same words. This is
 * the one, and anything that wants it calls `openSearchDialog()`; see
 * lib/client/search-dialog.ts for why that is an event rather than context.
 *
 * Bigger than it was, too. A command dialog is a place you read a list in, not
 * a dropdown: the panel is a fixed height rather than one that grows and
 * shrinks as results arrive, so the results area does not resize under the
 * reader's cursor between keystrokes.
 */

interface NavSearchProps {
  isDarkTheme: boolean;
}

export function NavSearch({ isDarkTheme }: NavSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebouncedValue(query, 250);
  const { searches, addSearch, clearSearches } = useRecentSearches();
  const { groups, loading, failed, flat } = useSiteSearch(isOpen ? debouncedQuery : "");

  // Anything on the site can ask for the dialog - the board's search field
  // does, seeded with whatever had already been typed there.
  useEffect(
    () =>
      onOpenSearchDialog((initialQuery) => {
        setQuery(initialQuery);
        setActiveIndex(0);
        setIsOpen(true);
      }),
    []
  );

  // The keyboard shortcut every search dialog is expected to have. Ignored
  // while the reader is typing somewhere else, so it cannot steal a Cmd+K that
  // belonged to a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A new query invalidates the cursor: index 3 of the old list is very often
  // past the end of the new one, which reads as "nothing selected".
  //
  // Adjusted during render rather than in an effect. An effect would be a
  // setState inside one - a second render pass on every keystroke - and the
  // reset would land after the browser had already painted the new results
  // with the stale row highlighted.
  const [cursorQuery, setCursorQuery] = useState(debouncedQuery);
  if (cursorQuery !== debouncedQuery) {
    setCursorQuery(debouncedQuery);
    setActiveIndex(0);
  }

  const go = useCallback(
    (hit: SearchHit) => {
      if (query.trim()) addSearch(query.trim());
      setIsOpen(false);
      setQuery("");
      router.push(hit.href);
    },
    [query, addSearch, router]
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flat.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[activeIndex];
      if (hit) go(hit);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setQuery("");
      }}
    >
      <DialogTrigger
        render={
          <button
            className={`flex w-full cursor-pointer items-center justify-between gap-6 border px-3.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider transition-all duration-150 lg:w-80 ${
              isDarkTheme
                ? "border-background/20 bg-foreground text-background hover:border-background"
                : "border-foreground/25 bg-card text-foreground shadow-[2px_2px_0px_0px_currentColor] hover:border-foreground active:translate-y-0.5 active:shadow-none"
            }`}
          >
            <span className="opacity-60">Search site...</span>
            <span className="flex items-center gap-2 opacity-60">
              <kbd className="hidden font-mono text-[0.5rem] sm:inline">⌘K</kbd>
              <Search className="h-3 w-3" />
            </span>
          </button>
        }
      />

      {/* Cream, with the contrast it was missing the first time.

          A fully dark palette read as a different product; the original
          flat cream one read as nothing at all. Neither is the answer: the
          body stays on the page's own paper, and the input sits in a solid
          ink bar across the top. That one band does the work - it says the
          panel took over the screen without the panel having to stop
          looking like the site, and it gives the eye somewhere to land.

          Widths step per breakpoint rather than sitting at one size:
          roughly 60% of the viewport is the comfortable band for a modal,
          and a single max-width is either cramped on a large display or
          overwhelming on a laptop. Height is fixed so the results area
          does not resize under the cursor between keystrokes. */}
      <DialogContent
        showCloseButton={false}
        className="z-[100] flex h-[min(38rem,84vh)] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-none border-2 border-foreground bg-background p-0 text-foreground shadow-[10px_10px_0px_0px_var(--foreground)] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"      >
        <div className="flex shrink-0 items-center gap-3 bg-foreground px-5 py-4 text-background">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-orange" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search arenas and people"
            aria-label="Search the site"
            aria-autocomplete="list"
            autoFocus
            className="flex-1 border-none bg-transparent font-sans text-[1.05rem] text-background outline-none placeholder:text-background/40"
          />
          <kbd className="hidden shrink-0 border border-background/30 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-background/60 sm:inline">
            Esc
          </kbd>
        </div>

        {/* Fixed height, scrolled internally: a panel that grows and shrinks as
            results arrive moves the row under the reader's cursor between
            keystrokes. */}
        <div className="min-h-0 flex-1 overflow-y-auto" role="listbox">
          {query.trim().length < 2 ? (
            <div className="p-5">
              <NavSearchRecent
                searches={searches}
                onClear={clearSearches}
                onSelect={(term) => setQuery(term)}
              />
            </div>
          ) : (
            <NavSearchResults
              groups={groups}
              loading={loading}
              failed={failed}
              query={query}
              activeIndex={activeIndex}
              onSelect={go}
              onHover={setActiveIndex}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t-2 border-foreground bg-secondary px-5 py-2.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-foreground/65">
          <span>↑↓ move</span>
          <span>⏎ open</span>
          <span>esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NavSearch;
