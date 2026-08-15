import Link from "next/link";

/**
 * Renders for any notFound() call. app/user/[id]/page.tsx and the arena detail
 * page both call it; until now there was no not-found.tsx anywhere in app/, so
 * they fell back to Next's unstyled default.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 border-2 border-foreground p-8 md:p-12 shadow-[4px_4px_0px_0px_var(--foreground)] bg-card">
        <span className="font-mono text-[0.55rem] text-orange uppercase tracking-[0.25em] font-bold">
          [ERROR // 404]
        </span>
        <h1 className="font-display italic text-4xl uppercase leading-none">
          Not Found
        </h1>
        <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
          This record is not in the registry. It may have been removed, or the
          link may be incorrect.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="px-6 py-2.5 bg-foreground text-background font-mono text-[0.6rem] font-bold tracking-wider uppercase hover:bg-orange transition-colors inline-block"
          >
            [Return Home]
          </Link>
        </div>
      </div>
    </main>
  );
}
