import { ImageResponse } from "next/og";

/**
 * The card that renders when the homepage is shared - on LinkedIn above all,
 * which is where the recruiter side of this product actually gets passed
 * around. There was no image at all before, so a shared link rendered as a
 * bare URL.
 *
 * Generated rather than a static asset: it stays in sync with the brand tokens
 * below and there is no binary to keep in the repo. Deliberately does not fetch
 * a webfont - that would put a network call on the build's critical path for a
 * gain no one viewing a 1200x630 thumbnail would notice.
 */
export const alt =
  "Devs Arena - team coding challenges in Egypt: four hours, a strange brief, and a judge who explains themselves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F1EFE9";
const INK = "#0E0E0D";
const ORANGE = "#E8621A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "64px 72px",
          // The blueprint grid the site carries on every section, at the same
          // 40px pitch.
          backgroundImage:
            "linear-gradient(to right, rgba(14,14,13,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,14,13,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 6,
              fontWeight: 700,
              color: ORANGE,
            }}
          >
            DEVS ARENA
          </div>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 4, opacity: 0.55 }}>
            CAIRO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 960,
            }}
          >
            Hackathons, but weirder.
          </div>
          <div style={{ display: "flex", fontSize: 31, lineHeight: 1.35, maxWidth: 900, opacity: 0.75 }}>
            Four-hour team challenges around briefs that have no business
            existing. Cairo and online. Free to enter.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            borderTop: `2px solid ${INK}`,
            paddingTop: 26,
            fontSize: 20,
            letterSpacing: 3,
          }}
        >
          <div style={{ display: "flex", background: ORANGE, color: PAPER, padding: "10px 18px", fontWeight: 700 }}>
            FREE TO ENTER
          </div>
          <div style={{ display: "flex", opacity: 0.6 }}>
            PICK A BRIEF &nbsp;/&nbsp; GRAB A TEAM &nbsp;/&nbsp; SHIP IT
          </div>
        </div>
      </div>
    ),
    size
  );
}
