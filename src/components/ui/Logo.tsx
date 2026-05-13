import { Link } from "react-router-dom";

/**
 * Brand logo lockup — the diamond mark designed by the brand owner
 * plus the "OBSIDIAN" wordmark. Always links to the home page.
 *
 * The image lives in `/public` so it is served as a static asset and
 * the URL works identically in `dev` and `build`.
 */
interface LogoProps {
  /** When true, hides the wordmark and only shows the mark. */
  markOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ markOnly = false, className = "", onClick }: LogoProps) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Obsidian home" onClick={onClick}>
      <img src="/obsidian-logo.png" alt="" aria-hidden="true" />
      {!markOnly && <span>OBSIDIAN</span>}
    </Link>
  );
}
