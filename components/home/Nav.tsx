export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-foreground text-primary-foreground">
      <div className="px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-[1.1rem]">Sherh</span>
          <span className="font-mono text-[0.6rem] text-orange tracking-[0.2em]">
            شرح
          </span>
          <span className="font-mono text-[0.6rem] opacity-35 border-l border-primary-foreground/20 pl-3 hidden sm:block">
            Egypt tech · salary transparency
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Companies
          </a>
          <a
            href="#"
            className="font-mono text-[0.6rem] opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider"
          >
            Reviews
          </a>
          <button className="font-mono text-[0.6rem] border border-primary-foreground/25 px-3 py-1.5 hover:bg-primary-foreground hover:text-foreground transition-colors uppercase tracking-wider">
            Submit salary
          </button>
        </div>
      </div>
    </nav>
  );
}
