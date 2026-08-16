import { buildArenaSlug } from "@/lib/arena-slug";
import type { ArenaSearchHit } from "@/lib/client/useArenaSearch";

/**
 * Results for the nav search dialog.
 *
 * One category, because the platform has exactly one searchable public entity
 * today. The previous version rendered three - People, Companies and Context -
 * all of them hardcoded fiction pointing at routes that do not resolve. A
 * single honest category beats three invented ones, and this is the site whose
 * entire product is that a claim can be checked.
 */

const DOMAIN_LABEL: Record<string, string> = {
  FULL_STACK_WEB: "Full stack",
  BACKEND_DISTRIBUTED: "Backend",
  FRONTEND_MOBILE: "Frontend",
  AI_MACHINE_LEARNING: "AI / ML",
  DATA_ENGINEERING: "Data",
  CYBERSECURITY_ETHICAL_HACKING: "Security",
  SYSTEMS_DEV_OPS: "Systems",
  EMBEDDED_IOT: "Embedded",
  BLOCKCHAIN_WEB3: "Web3",
};

interface NavSearchResultsProps {
  query: string;
  hits: ArenaSearchHit[];
  loading: boolean;
  failed: boolean;
  onResultClick: (url: string) => void;
}

export function NavSearchResults({
  query,
  hits,
  loading,
  failed,
  onResultClick,
}: NavSearchResultsProps) {
  if (loading && hits.length === 0) {
    return (
      <p className="py-6 text-center text-foreground/50" role="status">
        Searching&hellip;
      </p>
    );
  }

  if (failed) {
    return (
      <p className="py-6 text-center text-accent" role="status">
        Search is unavailable right now. Try again in a moment.
      </p>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="py-6 text-center space-y-2" role="status">
        <p className="text-foreground/70">
          No arena matches &ldquo;{query}&rdquo;
        </p>
        <button
          onClick={() => onResultClick("/arena")}
          className="text-orange border-b border-orange/40 hover:border-orange transition-colors bg-transparent border-x-0 border-t-0 cursor-pointer font-mono text-[0.6rem] uppercase tracking-wider"
        >
          Browse the whole board &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between border-b border-foreground/10 pb-1 font-bold text-foreground/60">
        <span>Arenas ({hits.length})</span>
        <button
          onClick={() => onResultClick("/arena")}
          className="font-mono text-[0.55rem] uppercase tracking-wider text-orange hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          See all &rarr;
        </button>
      </div>

      <ul className="divide-y divide-foreground/5">
        {hits.map((a) => (
          <li key={a.id}>
            <button
              onClick={() => onResultClick(`/arena/${buildArenaSlug(a.title, a.id)}`)}
              className="w-full text-left py-2 px-2 hover:bg-foreground/5 transition-colors cursor-pointer bg-transparent border-none flex items-start justify-between gap-4"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-foreground truncate normal-case">
                  {a.title}
                </span>
                <span className="block text-[0.55rem] text-foreground/50 mt-0.5">
                  {[
                    a.domain ? DOMAIN_LABEL[a.domain] ?? a.domain : null,
                    a.isTeam ? "Team" : "Solo",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </span>
              <span className="text-[0.55rem] opacity-40 shrink-0 pt-0.5">Open &rarr;</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NavSearchResults;
