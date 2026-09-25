import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * Legal pages — Privacy Policy and Terms of Service.
 *
 * Both share one layout because they are plain prose documents; only the
 * heading and the section list differ. They are also the pages Google's
 * OAuth consent screen links to, so the privacy copy has to describe the
 * real data flow: Google sign-in stores name, email and avatar, and the
 * checkout is simulated (no payment data ever reaches the server).
 *
 * The texts live in legal.json. Each section there has a "title" and its
 * paragraphs as "p1", "p2"...
 */

interface Section {
  /** Key of the section in legal.json, e.g. "who". */
  id: string;
  /** How many paragraphs it has (p1, p2...). */
  paragraphs: number;
}

function LegalPage({ page, sections }: { page: "privacy" | "terms"; sections: Section[] }) {
  const { t } = useTranslation("legal");

  return (
    <main className="fade-in legal">
      <div className="legal-head">
        <span className="legal-eyebrow">{t("eyebrow")}</span>
        <h1>{t(`${page}.title`)}</h1>
        <p className="legal-intro">{t(`${page}.intro`)}</p>
      </div>

      <div className="legal-body">
        {sections.map((section, index) => (
          <section key={section.id}>
            <h2>
              <span className="legal-num">{String(index + 1).padStart(2, "0")}</span>
              {t(`${page}.sections.${section.id}.title`)}
            </h2>
            {Array.from({ length: section.paragraphs }, (_, i) => (
              <p key={i}>{t(`${page}.sections.${section.id}.p${i + 1}`)}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="legal-foot">
        <Link to="/">{t("back")}</Link>
      </div>
    </main>
  );
}

export function Privacy() {
  return (
    <LegalPage
      page="privacy"
      sections={[
        { id: "who", paragraphs: 1 },
        { id: "collect", paragraphs: 3 },
        { id: "never", paragraphs: 2 },
        { id: "why", paragraphs: 1 },
        { id: "where", paragraphs: 1 },
        { id: "rights", paragraphs: 2 },
        { id: "changes", paragraphs: 1 },
      ]}
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      page="terms"
      sections={[
        { id: "notForSale", paragraphs: 1 },
        { id: "account", paragraphs: 2 },
        { id: "availability", paragraphs: 1 },
        { id: "imagery", paragraphs: 1 },
        { id: "contact", paragraphs: 1 },
      ]}
    />
  );
}
