import { ArenaContainer } from "@/components/arena/ArenaContainer";
import { ArenaRowSkeleton } from "@/components/arena/list/ArenaRow";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

/**
 * The board's skeleton, and the reason `(board)` is a route group.
 *
 * `page.tsx` is force-dynamic and runs three queries before it can render, so
 * navigating to /arena used to block on them with no feedback. This streams
 * immediately instead.
 *
 * It lived one directory up, which put a Suspense boundary around
 * `/arena/[id]` as well - and a page that has already begun streaming cannot
 * change its status code, so every `notFound()` on an arena detail page
 * answered 200 with 404 markup. A soft 404 on exactly the URLs the private
 * gate exists to hide is the worst version of that bug: a crawler indexes them
 * as real pages. The group scopes the boundary to the one route that wants it.
 *
 * The shape has to track `ArenasListClient` or it is worse than nothing - a
 * skeleton that resolves into a different layout reads as the page breaking.
 * Rail left, rows right, same widths.
 */
export default function ArenaListLoading() {
  return (
    <main className="relative min-h-screen bg-background text-foreground" aria-busy="true">
      <BackgroundGrid opacity={0.055} />

      <div className="sr-only" role="status">
        Loading arenas
      </div>

      {/* The masthead is static copy, so it is drawn rather than greyed out -
          there is nothing to wait for and no reason to withhold it. */}
      <div className="relative w-full overflow-hidden border-b-2 border-orange bg-foreground text-background">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(224,94,24,0.16),transparent_45%,rgba(224,94,24,0.07))]"
        />
        <BackgroundGrid opacity={0.07} patternSize={28} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-20">
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.3em] text-orange">
            [ The board ]
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,5vw,3.4rem)] italic leading-[1.05] text-background">
            Every arena you can enter, and every one you missed
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-background/70">
            Somebody posts a brief with no business existing. A few teams build
            it against a clock. Free to enter, online or in a room in Cairo.
          </p>
        </div>
      </div>

      <ArenaContainer className="relative z-10 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-6">
            {[9, 14, 20, 11].map((rows, i) => (
              <div
                key={i}
                className="border border-foreground/15 bg-card p-4"
                style={{ height: `${rows * 0.75}rem` }}
              >
                <div className="h-2 w-24 animate-pulse bg-foreground/15" />
              </div>
            ))}
          </aside>

          <div className="flex flex-col gap-4">
            <div className="h-12 animate-pulse border border-foreground/15 bg-card" />
            {Array.from({ length: 6 }).map((_, i) => (
              <ArenaRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </ArenaContainer>
    </main>
  );
}
