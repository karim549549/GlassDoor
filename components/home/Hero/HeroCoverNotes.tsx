import { HeroStatBlocks } from "./HeroStatBlocks";
import { HeroPlatformCta } from "./HeroPlatformCta";
import { HeroActivityTicker } from "./HeroActivityTicker";

export function HeroCoverNotes({ openCount = 0 }: { openCount?: number }) {
  return (
    <>
      <HeroStatBlocks openCount={openCount} />
      <HeroPlatformCta />
      <HeroActivityTicker />
    </>
  );
}
export default HeroCoverNotes;
