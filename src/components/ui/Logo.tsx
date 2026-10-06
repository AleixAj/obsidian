import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * The logo: the diamond image and the word "OBSIDIAN".
 * It always links to the home page.
 */
interface LogoProps {
  /** When true, hides the wordmark and only shows the mark. */
  markOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ markOnly = false, className = "", onClick }: LogoProps) {
  const { t } = useTranslation();
  return (
    <Link to="/" className={`logo ${className}`} aria-label={t("logo.home")} onClick={onClick}>
      <img src="/obsidian-logo-96.webp" alt="" aria-hidden="true" width={31} height={31} />
      {!markOnly && <span>OBSIDIAN</span>}
    </Link>
  );
}
