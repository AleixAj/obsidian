import type { CSSProperties } from "react";

/**
 * A box with a photo as its background.
 *
 * With `img` it shows the photo, with a dark gradient on top so light
 * photos don't look out of place on the black page. Without `img` it
 * shows a striped box instead.
 */
interface PlaceholderProps {
  /** Small text in the bottom-left corner. */
  label?: string;
  /** Colour of the stripes when there is no photo. */
  palette?: "warm" | "gold";
  /** Shows the small gold corner bracket. */
  corner?: boolean;
  className?: string;
  style?: CSSProperties;
  /** When set, the URL becomes the background image. */
  img?: string | null;
  /** Puts the dark gradient on top of the photo. */
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
