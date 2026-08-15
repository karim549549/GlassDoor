import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display font-medium">
            Devs Arena
          </span>
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            Developer competitions &amp; verified hiring credentials — 2026
          </span>
        </div>
        <div className="font-mono text-[0.6rem] flex gap-6 text-muted-foreground">
          <Link href="/arena" className="hover:text-foreground transition-colors">Arenas</Link>
          <Link href="/companies" className="hover:text-foreground transition-colors">Companies</Link>
          <Link href="/billboard" className="hover:text-foreground transition-colors">Billboard</Link>
        </div>
      </div>
    </footer>
  );
}
