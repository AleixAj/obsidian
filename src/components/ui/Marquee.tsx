/**
 * Horizontal infinite-scroll marquee.
 *
 * The trick: render the items twice and translate the row by -50% so
 * the second copy lines up exactly with the first when the animation
 * loops — giving a seamless infinite scroll using CSS only.
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
