/**
 * A line of text that scrolls sideways without end.
 *
 * The trick: we write the items twice, and the CSS animation moves the
 * row by half its width. When it starts again, the second copy is exactly
 * where the first one was, so you never see the jump.
 */
interface MarqueeProps {
  items: string[];
  /** "" = default 40s loop, "fast" = 22s. */
  speed?: "" | "fast";
}

export function Marquee({ items, speed = "" }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee ${speed}`}>
      {doubled.map((item, i) => (
        <span key={i} className="marquee-item">
          {item}
          <span className="star">✦</span>
        </span>
      ))}
    </div>
  );
}
