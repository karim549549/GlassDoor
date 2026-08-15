interface NavSearchRecentProps {
  searches: string[];
  onClear: () => void;
  onSelect: (term: string) => void;
}

export function NavSearchRecent({ searches, onClear, onSelect }: NavSearchRecentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-1.5">
        <span className="font-bold text-foreground/60">Recent Searches</span>
        {searches.length > 0 && (
          <button
            onClick={onClear}
            className="text-[0.55rem] text-orange hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            Clear history
          </button>
        )}
      </div>
      {searches.length === 0 ? (
        <div className="text-[0.6rem] text-muted-foreground/60 italic lowercase normal-case py-1">
          No recent searches.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {searches.map((term, index) => (
            <button
              key={index}
              onClick={() => onSelect(term)}
              className="px-2 py-1 bg-card border border-foreground text-foreground hover:bg-foreground hover:text-card transition-colors cursor-pointer text-[0.58rem]"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavSearchRecent;
