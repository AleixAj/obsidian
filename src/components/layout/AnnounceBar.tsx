import { useTranslation } from "react-i18next";
import { Marquee } from "../ui/Marquee";

/** The messages of the thin bar at the very top. They are translation keys (announce.*). */
const TOP_MESSAGES = ["drop", "shipping", "innerCircle", "madeIn", "limited"];

export function AnnounceBar() {
  const { t } = useTranslation();
  return (
    <div className="announce">
      <Marquee items={TOP_MESSAGES.map((key) => t(`announce.${key}`))} />
    </div>
  );
}
