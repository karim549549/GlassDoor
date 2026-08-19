"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ArenaDetailDto } from "@/lib/arena/dto";

/**
 * Who is in — as a lobby, not a list.
 *
 * The first version grouped names under a heading per team, which is a
 * directory: accurate, and it made a Saturday with your friends look like a
 * staff roster. An arena is people agreeing to build something together on a
 * clock, and the screen that shows them should feel like the party screen in a
 * game or a channel with a handful of people already in it.
 *
 * So: a card per team, faces in a row, and the seats nobody has taken drawn as
 * empty slots rather than left as absence. An empty slot is the friendliest
 * thing on the page — it is the only element that says *you could be here*,
 * and it turns "3 people" into "one space left", which is a different feeling
 * about the same fact.
 *
 * Names and handles only. Every entry used to arrive carrying its user's id —
 * withdrawn entries too — so the page could compute one boolean;
 * `lib/arena/dto.ts` strips them before they leave the server.
 */

type Participant = ArenaDetailDto["participants"][number];

/** Rendered before a "show the rest" button, so a full arena is not 200 rows. */
const VISIBLE_TEAMS = 12;
const VISIBLE_SOLO = 24;

function Avatar({
  person,
  size = 32,
}: {
  person: Pick<Participant, "displayName" | "avatarUrl">;
  size?: number;
}) {
  if (person.avatarUrl) {
    return (
      <Image
        src={person.avatarUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 border border-foreground/15 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center border border-foreground/15 bg-secondary font-mono text-[0.65rem] font-bold uppercase text-foreground/65"
    >
      {person.displayName.replace(/^@/, "").charAt(0)}
    </span>
  );
}

/** A seat nobody has taken. The only thing on the page that invites you in. */
function EmptySeat() {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-foreground/30 font-mono text-[0.7rem] text-foreground/30"
    >
      +
    </span>
  );
}

function PersonLine({ person }: { person: Participant }) {
  const label = (
    <>
      <span className="truncate">{person.displayName}</span>
      {person.isTeamLeader && (
        <span className="shrink-0 font-mono text-[0.5rem] font-bold uppercase tracking-[0.16em] text-orange-ink">
          leads
        </span>
      )}
    </>
  );

  if (person.handle) {
    return (
      <Link
        href={`/u/${person.handle}`}
        className="flex items-center gap-2 font-sans text-[0.82rem] text-foreground/80 underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        {label}
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2 font-sans text-[0.82rem] text-foreground/80">
      {label}
    </span>
  );
}

function TeamCard({
  name,
  members,
  maxTeamSize,
}: {
  name: string;
  members: Participant[];
  maxTeamSize: number;
}) {
  const free = Math.max(0, maxTeamSize - members.length);

  return (
    <li className="flex flex-col border border-foreground/15 bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-foreground/12 px-4 py-2.5">
        <h3 className="min-w-0 truncate font-sans text-sm font-semibold text-foreground">
          {name}
        </h3>
        <span className="shrink-0 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] tabular-nums text-foreground/55">
          {members.length}/{maxTeamSize}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3.5">
        {members.map((member) => (
          <Avatar key={`${name}-${member.displayName}`} person={member} />
        ))}
        {Array.from({ length: free }).map((_, i) => (
          <EmptySeat key={`free-${i}`} />
        ))}
      </div>

      <ul className="flex flex-col gap-1 px-4 py-3">
        {members.map((member) => (
          <li key={`${name}-line-${member.displayName}`} className="min-w-0">
            <PersonLine person={member} />
          </li>
        ))}
      </ul>

      {free > 0 && (
        <p className="mt-auto border-t border-foreground/10 px-4 py-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-orange-ink">
          {free === 1 ? "1 seat left" : `${free} seats left`}
        </p>
      )}
    </li>
  );
}

export function ArenaParticipants({
  participants,
  isTeam,
  maxTeamSize,
}: {
  participants: Participant[];
  isTeam: boolean;
  maxTeamSize: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (participants.length === 0) {
    return (
      <p className="border border-dashed border-foreground/25 px-5 py-8 text-center font-sans text-sm leading-relaxed text-foreground/60">
        {isTeam
          ? "No teams yet. Someone has to go first, and the first team gets to pick the name."
          : "Nobody yet. Someone has to be first."}
      </p>
    );
  }

  const solo = participants.filter((p) => p.teamName === null);
  const teams = new Map<string, Participant[]>();
  for (const p of participants) {
    if (p.teamName === null) continue;
    const existing = teams.get(p.teamName);
    if (existing) existing.push(p);
    else teams.set(p.teamName, [p]);
  }

  const allTeams = [...teams.entries()];
  const shownTeams = expanded ? allTeams : allTeams.slice(0, VISIBLE_TEAMS);
  const shownSolo = expanded ? solo : solo.slice(0, VISIBLE_SOLO);
  const hidden =
    allTeams.length - shownTeams.length + (solo.length - shownSolo.length);

  return (
    <div className="flex flex-col gap-6">
      {shownTeams.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shownTeams.map(([name, members]) => (
            <TeamCard key={name} name={name} members={members} maxTeamSize={maxTeamSize} />
          ))}
        </ul>
      )}

      {shownSolo.length > 0 && (
        <div className="border border-foreground/15 bg-card">
          <h3 className="border-b border-foreground/12 px-4 py-2.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-foreground/70">
            {isTeam ? "Looking for a team" : "In"}
          </h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-2 xl:grid-cols-3">
            {shownSolo.map((person) => (
              <li key={person.entryId} className="flex min-w-0 items-center gap-2.5 py-1">
                <Avatar person={person} size={28} />
                <PersonLine person={person} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cursor-pointer self-start border border-foreground/25 bg-background px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Show {hidden} more
        </button>
      )}
    </div>
  );
}

export default ArenaParticipants;
