import { Marquee } from "../ui/Marquee";

/** Thin marquee strip at the very top of the page. */
const TOP_MESSAGES = [
  "✦ Drop 04 — Aurum Live Now",
  "Free shipping over €200",
  "Inner Circle ✦ Early access",
  "Made in Barcelona · Cast in gold",
  "Limited to 200 units per piece",
];

export function AnnounceBar() {
  return (
    <div className="announce">
      <Marquee items={TOP_MESSAGES} />
    </div>
  );
}
