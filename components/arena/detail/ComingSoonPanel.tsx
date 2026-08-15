import React from "react";

interface ComingSoonPanelProps {
  /** Bracketed section marker, matching the mastheads used across the app. */
  label: string;
  title: string;
  body: string;
}

/**
 * Honest placeholder for an arena surface that has no data behind it yet.
 *
 * This replaces two components that rendered hardcoded constants on live pages:
 * a leaderboard of eight fictional winners and a thread of six fake comments,
 * both of which appeared identically on every arena in the database. On a
 * platform selling verifiable results, fabricated ones are worse than none.
 */
export function ComingSoonPanel({ label, title, body }: ComingSoonPanelProps) {
  return (
    <div className="border-2 border-dashed border-foreground/30 bg-card p-6 space-y-2">
      <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-orange font-bold block">
        {label}
      </span>
      <h3 className="font-display italic text-xl uppercase leading-none">{title}</h3>
      <p className="font-mono text-[0.55rem] uppercase tracking-widest text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}

export default ComingSoonPanel;
