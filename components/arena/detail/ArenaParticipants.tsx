import Link from "next/link";
import Image from "next/image";
import type { ArenaDetailDto } from "@/lib/arena/dto";
import { DetailPanel } from "./panels";

/**
 * Who is in, by name, grouped by team where there are teams.
 *
 * Names and handles only. Every entry used to arrive carrying its user's id -
 * for withdrawn entries too - so that the page could compute one boolean;
 * `lib/arena/dto.ts` now strips them before they leave the server, and there is
 * nothing here that would want one.
 *
 * People, not a count. The count is in the action panel, where it is a fact
 * about capacity; this is the part that makes an arena look like somewhere
 * worth turning up to.
 */

type Participant = ArenaDetailDto["participants"][number];

function Avatar({ participant }: { participant: Participant }) {
  if (participant.avatarUrl) {
    return (
      <Image
        src={participant.avatarUrl}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 border border-foreground/15 object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center border border-foreground/15 bg-secondary font-mono text-[0.6rem] font-bold uppercase text-foreground/60"
    >
      {participant.displayName.replace(/^@/, "").charAt(0)}
    </span>
  );
}

function Row({ participant }: { participant: Participant }) {
  const inner = (
    <>
      <Avatar participant={participant} />
      <span className="min-w-0 flex-1 truncate font-sans text-sm text-foreground">
        {participant.displayName}
      </span>
      {participant.isTeamLeader && (
        <span className="shrink-0 font-mono text-[0.5rem] font-bold uppercase tracking-[0.16em] text-orange-ink">
          Leads
        </span>
      )}
    </>
  );

  // Only someone who has set a handle has a page to link to.
  if (participant.handle) {
    return (
      <Link
        href={`/u/${participant.handle}`}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-secondary/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange"
      >
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5 px-4 py-2">{inner}</div>;
}

export function ArenaParticipants({
  participants,
  isTeam,
}: {
  participants: Participant[];
  isTeam: boolean;
}) {
  if (participants.length === 0) {
    return (
      <DetailPanel title={isTeam ? "Teams" : "Who's in"}>
        <p className="px-4 py-5 font-sans text-[0.8rem] leading-relaxed text-foreground/60">
          Nobody yet. Someone has to be first.
        </p>
      </DetailPanel>
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

  return (
    <DetailPanel title={isTeam ? "Teams" : "Who's in"} aside={`${participants.length}`}>
      <div className="divide-y divide-foreground/10">
        {[...teams.entries()].map(([name, members]) => (
          <div key={name}>
            <h3 className="px-4 pb-1 pt-3 font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-foreground/50">
              {name} · {members.length}
            </h3>
            <div className="pb-1">
              {members.map((member) => (
                <Row key={`${name}-${member.displayName}`} participant={member} />
              ))}
            </div>
          </div>
        ))}

        {solo.length > 0 && (
          <div className="py-1">
            {solo.map((participant) => (
              <Row key={participant.entryId} participant={participant} />
            ))}
          </div>
        )}
      </div>
    </DetailPanel>
  );
}

export default ArenaParticipants;
