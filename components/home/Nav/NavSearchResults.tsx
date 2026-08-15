import type { MockCompany, MockContextEntry, MockUser } from "./nav-search-mock-data";

interface NavSearchResultsProps {
  query: string;
  matchedUsers: MockUser[];
  matchedCompanies: MockCompany[];
  matchedContext: MockContextEntry[];
  onResultClick: (url: string) => void;
}

export function NavSearchResults({
  query,
  matchedUsers,
  matchedCompanies,
  matchedContext,
  onResultClick,
}: NavSearchResultsProps) {
  const hasResults = matchedUsers.length > 0 || matchedCompanies.length > 0 || matchedContext.length > 0;

  return (
    <div className="space-y-4">
      {/* Category: People */}
      {matchedUsers.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-bold text-foreground/60 border-b border-foreground/10 pb-1">
            People / Users ({matchedUsers.length})
          </div>
          <div className="divide-y divide-foreground/5">
            {matchedUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => onResultClick(`/user/${u.id}`)}
                className="py-2 px-2 hover:bg-foreground/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{u.name}</span>
                  <span className="text-[0.58rem] text-orange lowercase">@{u.handle}</span>
                </div>
                <span className="text-[0.55rem] opacity-40">Profile →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category: Companies */}
      {matchedCompanies.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-bold text-foreground/60 border-b border-foreground/10 pb-1">
            Companies ({matchedCompanies.length})
          </div>
          <div className="divide-y divide-foreground/5">
            {matchedCompanies.map((c) => (
              <div
                key={c.id}
                onClick={() => onResultClick(`/companies/${c.id}`)}
                className="py-2 px-2 hover:bg-foreground/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{c.name}</span>
                  <span className="text-[0.58rem] text-muted-foreground">{c.sector}</span>
                </div>
                <span className="text-[0.55rem] opacity-40">Arenas & Hiring →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category: Context */}
      {matchedContext.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-bold text-foreground/60 border-b border-foreground/10 pb-1">
            Context / Guides ({matchedContext.length})
          </div>
          <div className="divide-y divide-foreground/5">
            {matchedContext.map((co) => (
              <div
                key={co.id}
                onClick={() => onResultClick(co.url)}
                className="py-2 px-2 hover:bg-foreground/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{co.title}</span>
                  <span className="text-[0.58rem] text-muted-foreground lowercase normal-case">{co.description}</span>
                </div>
                <span className="text-[0.55rem] opacity-40">View →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResults && (
        <div className="text-center py-6 text-muted-foreground lowercase normal-case italic">
          No matching results found for &quot;{query}&quot;.
        </div>
      )}
    </div>
  );
}

export default NavSearchResults;
