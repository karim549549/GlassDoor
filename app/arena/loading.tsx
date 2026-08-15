/**
 * app/arena/page.tsx is force-dynamic and runs a database query before it can
 * render anything, so navigation to /arena previously blocked on that query
 * with no visual feedback. This streams immediately while it runs.
 */
export default function ArenaListLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground" aria-busy="true">
      <div className="sr-only" role="status">
        Loading arenas
      </div>

      <div className="bg-foreground text-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="h-2 w-40 bg-background/20 animate-pulse" />
          <div className="h-10 w-72 bg-background/20 animate-pulse" />
          <div className="h-2 w-full max-w-xl bg-background/10 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 border-2 border-foreground/15 bg-card animate-pulse"
              />
            ))}
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 border-2 border-foreground/15 bg-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
