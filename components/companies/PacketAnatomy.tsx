import { PACKET_ANATOMY } from "./hiring-content";

/**
 * The page's thesis, made visual: the credential itself, dissected.
 *
 * Every other platform in this category has to *describe* its assessment,
 * because what it hands over is a score. What this hands over is a document, so
 * the honest move is to show its anatomy and let a technical reader judge
 * whether it is worth anything.
 *
 * Deliberately shows the SHAPE and not a specimen. A worked example would need
 * a developer's name, a score and a repository, and no judged result exists to
 * draw one from - so it would be invented, on the page whose entire argument is
 * that nothing here is invented. Field names are the real keys from
 * `ProofPacketSnapshot`; a reader who later opens a packet finds exactly these.
 */
export function PacketAnatomy() {
  return (
    <div className="border-2 border-foreground bg-card shadow-[8px_8px_0_0_var(--foreground)]">
      {/* Document chrome - reads as an artifact rather than a marketing panel. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-foreground bg-foreground px-4 py-2.5 text-background">
        <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.22em]">
          Proof packet
        </span>
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-60">
          Public URL / no account needed
        </span>
      </div>

      <dl className="divide-y divide-foreground/12">
        {PACKET_ANATOMY.map((s) => (
          <div
            key={s.key}
            className="grid gap-x-6 gap-y-2 px-4 py-5 md:grid-cols-[minmax(0,15rem)_1fr] md:px-6"
          >
            <div>
              <dt className="font-display text-[1.05rem] leading-tight">{s.label}</dt>
              {/* The real payload keys. A technical reader checks these against
                  an actual packet, which is the point of printing them. */}
              <p className="mt-2 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-orange">
                {s.key}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {s.fields.map((f) => (
                  <li
                    key={f}
                    className="font-mono text-[0.5rem] tracking-[0.04em] text-foreground/45 break-words"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <dd className="text-[0.9rem] leading-relaxed text-foreground/80">{s.gloss}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default PacketAnatomy;
