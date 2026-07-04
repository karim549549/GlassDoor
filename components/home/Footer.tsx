export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display font-medium">
            Sherh شرح
          </span>
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            Egypt tech salary transparency - 2024
          </span>
        </div>
        <div className="font-mono text-[0.6rem] flex gap-6 text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">About</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Submit data</a>
          <a href="#" className="hover:text-foreground transition-colors">API</a>
        </div>
      </div>
    </footer>
  );
}
