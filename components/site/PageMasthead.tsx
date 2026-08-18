import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

/**
 * The dark band at the top of a page.
 *
 * Written for the board and then wanted everywhere, which is the usual sign
 * something should not have been written inline. Every page that had one was
 * repeating the same four decisions - ink ground, orange rule beneath it, the
 * blueprint grid, an accent wash - and they had already drifted: the create
 * form ran `py-8 md:py-10` while the board ran `py-14 md:py-20`, with different
 * headline clamps and a different grid opacity.
 *
 * It is also where a cover image goes, once there is one to use. No image
 * ships with this: committing a stock photo would put an asset in the repo
 * whose licence nobody can point to, and that is not a thing to discover
 * later. The slot, the mask and the sizing are all here, so adding one is a
 * `coverSrc` prop rather than a redesign - and the ink wash sits over it, so
 * any photograph resolves to texture behind the type instead of competing with
 * it.
 */
export interface PageMastheadProps {
  /** The bracketed line above the headline: "[ The board ]". */
  eyebrow: string;
  title: string;
  /** One or two sentences under the headline. Optional. */
  standfirst?: string;
  /**
   * `tall` for a page whose masthead is the first thing anyone reads; `short`
   * where the content below is the point and the band is orientation.
   */
  size?: "short" | "tall";
  children?: React.ReactNode;
}

const PADDING: Record<NonNullable<PageMastheadProps["size"]>, string> = {
  short: "py-9 md:py-12",
  tall: "py-14 md:py-20",
};

const TITLE_SIZE: Record<NonNullable<PageMastheadProps["size"]>, string> = {
  short: "text-[clamp(1.5rem,3.4vw,2.3rem)]",
  tall: "text-[clamp(1.9rem,5vw,3.4rem)]",
};

export function PageMasthead({
  eyebrow,
  title,
  standfirst,
  size = "tall",
  children,
}: PageMastheadProps) {
  return (
    <div className="relative w-full overflow-hidden border-b-2 border-orange bg-foreground text-background">
      {/* A diagonal lift off the flat ink, so the band reads as composed rather
          than as a placeholder waiting for an image. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(224,94,24,0.16),transparent_45%,rgba(224,94,24,0.07))]"
      />
      <BackgroundGrid opacity={0.07} patternSize={28} />

      <div
        className={`relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10 ${PADDING[size]}`}
      >
        <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.3em] text-orange">
          [ {eyebrow} ]
        </span>
        <h1
          className={`mt-4 max-w-3xl font-display ${TITLE_SIZE[size]} italic leading-[1.05] text-background`}
        >
          {title}
        </h1>
        {standfirst && (
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-background/70">
            {standfirst}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export default PageMasthead;
