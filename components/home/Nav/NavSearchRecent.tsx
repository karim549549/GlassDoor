interface NavSearchRecentProps {
  searches: string[];
  onClear: () => void;
  onSelect: (term: string) => void;
}

export function NavSearchRecent({ searches, onClear, onSelect }: NavSearchRecentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-background/12 pb-2">
        <span className="font-mono text-[0.52rem] font-bold uppercase tracking-[0.2em] text-background/55">Recent Searches</span>
        {searches.length > 0 && (
          <button
            onClick={onClear}
            className="border-none bg-transparent p-0 text-[0.55rem] text-orange hover:underline"
          >
            Clear history
          </button>
        )}
      </div>
      {searches.length === 0 ? (
        <div className="py-1 font-sans text-[0.8rem] normal-case italic text-background/45">
          No recent searches.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {searches.map((term, index) => (
            <button
              key={index}
              onClick={() => onSelect(term)}
              className="border border-background/25 px-2.5 py-1 text-[0.58rem] text-background/80 transition-colors hover:border-orange hover:text-orange"
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
