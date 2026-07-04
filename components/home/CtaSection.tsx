import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="px-6 py-12">
      <div className="bg-foreground text-primary-foreground p-7 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl">
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] opacity-38 mb-4">
            Contribute
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.625rem, 3vw, 2.75rem)", lineHeight: 1.08 }}>
            Know what you&rsquo;re worth.<br />
            <em>Help the next person know too.</em>
          </h2>
          <p className="opacity-55 leading-relaxed mt-4 text-[0.875rem]">
            Takes 2 minutes. Completely anonymous. The database only grows if
            engineers add to it - the same people posting &ldquo;does anyone know what
            X pays?&rdquo; on Facebook can fix this problem.
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between border border-primary-foreground/25 px-5 py-3.5 hover:bg-primary-foreground hover:text-foreground transition-colors group">
            <span className="text-sm font-medium">Submit your salary</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full flex items-center justify-between border border-primary-foreground/25 px-5 py-3 hover:bg-primary-foreground hover:text-foreground transition-colors group opacity-65 hover:opacity-100">
            <span className="text-sm">Write a company review</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
