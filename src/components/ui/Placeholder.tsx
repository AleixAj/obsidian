import type { CSSProperties } from "react";

/**
 * A versatile image / image-placeholder element.
 *
 * If `img` is provided it renders the photo with an optional dark
 * gradient overlay (so light photos still look on-brand against a
 * black layout). Without `img` it falls back to a striped placeholder
 * — useful for category cards or while real assets aren't ready.
 */
interface PlaceholderProps {
  /** Optional label rendered in the bottom-left corner (mono caption). */
  label?: string;
  /** Visual palette hint for the fallback stripes. */
  palette?: "warm" | "gold";
  /** Shows the small gold corner bracket. */
  corner?: boolean;
  className?: string;
  style?: CSSProperties;
  /** When set, the URL becomes the background image. */
  img?: string | null;
  /** Whether to overlay a dark gradient to anchor light photos. */
  tint?: boolean;
}

export function Placeholder({
  label,
  palette = "warm",
  corner = true,
  className = "",
  style = {},
  img = null,
  tint = true,
}: PlaceholderProps) {
  const bgStyle: CSSProperties = img
    ? {
        backgroundImage: `${
          tint
            ? "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.45) 100%),"
            : ""
        } url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...style,
      }
    : style;

  return (
    <div className={`ph ${palette} ${img ? "has-img" : ""} ${className}`} style={bgStyle}>
      {corner && <span className="ph-corner" />}
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}
