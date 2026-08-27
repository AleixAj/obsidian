import { Link } from "react-router-dom";

/**
 * Legal pages — Privacy Policy and Terms of Service.
 *
 * Both share one layout because they are plain prose documents; only the
 * heading and the section list differ. They are also the pages Google's
 * OAuth consent screen links to, so the privacy copy has to describe the
 * real data flow: Google sign-in stores name, email and avatar, and the
 * checkout is simulated (no payment data ever reaches the server).
 */

interface Section {
  title: string;
  body: string[];
}

const UPDATED = "August 2026";

function LegalPage({ eyebrow, title, intro, sections }: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main className="fade-in legal">
      <div className="legal-head">
        <span className="legal-eyebrow">{eyebrow} ✦ Updated {UPDATED}</span>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
      </div>

      <div className="legal-body">
        {sections.map((section, index) => (
          <section key={section.title}>
            <h2>
              <span className="legal-num">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="legal-foot">
        <Link to="/">← Back to Obsidian</Link>
      </div>
    </main>
  );
}

export function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Obsidian is a fictional streetwear brand built as a portfolio project. Nothing here is sold and no payment is ever processed, but the accounts and orders you create are stored for real — this page explains exactly what that means."
      sections={[
        {
          title: "Who runs this site",
          body: [
            "Obsidian is a personal demonstration project by Aleix Auqué. It is not a registered company and does not trade. For any question about this policy or about data held about you, write to aleixauque@gmail.com.",
          ],
        },
        {
          title: "What we collect",
          body: [
            "If you create an account with an email and password, we store your name, your email address and a securely hashed version of your password. The password itself is never stored in a readable form.",
            "If you sign in with Google, Google shares your name, your email address and your profile picture with us. We store those three things and an identifier that lets us recognise you next time. We never receive your Google password, and we cannot read your Gmail, Drive, contacts or anything else in your Google account.",
            "We also store what you do inside the store: items in your bag, your wishlist, the shipping addresses you save and the simulated orders you place.",
          ],
        },
        {
          title: "What we never collect",
          body: [
            "No payment details. The checkout is a simulation — there is no card form, no payment provider and no charge. Orders exist only as rows in our database so the account area has something to show.",
            "No advertising or tracking cookies, and no third-party analytics. The only cookie we set is the one that keeps you signed in.",
          ],
        },
        {
          title: "Why we keep it",
          body: [
            "Purely to make the store work: to keep you signed in, to remember your bag between visits and to show your order history. Your data is never sold, rented or shared with third parties, and it is never used to send you marketing.",
          ],
        },
        {
          title: "Where it lives",
          body: [
            "Data is stored in a database hosted on Railway, on servers located in the European Union. The site itself is served through Cloudflare. Both providers can technically access the infrastructure that holds the data, as any hosting provider can.",
          ],
        },
        {
          title: "Your rights",
          body: [
            "You can ask us to show you, correct or permanently delete everything we hold about you, and we will do it — write to aleixauque@gmail.com and allow a few days for a reply. If you signed in with Google, you can also revoke this site's access at any time from your Google Account settings, under 'Third-party apps with account access'.",
            "Because this is a demonstration project and not a business, data may be wiped without notice, for example when rebuilding the database. Do not store anything here that you would be sorry to lose.",
          ],
        },
        {
          title: "Changes",
          body: [
            "If this policy changes, the date at the top of the page changes with it.",
          ],
        },
      ]}
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="The short version: Obsidian is a portfolio demonstration, not a shop. Nothing you order will ever arrive, because nothing is actually for sale."
      sections={[
        {
          title: "Nothing here is for sale",
          body: [
            "Obsidian is a fictional brand. The garments, prices, stock counts and drop dates are invented for the purposes of a design and engineering portfolio. Placing an order creates a record in a database and nothing else: no payment is taken, no contract is formed and no item will ever be shipped.",
          ],
        },
        {
          title: "Your account",
          body: [
            "You are responsible for keeping your credentials to yourself. Please do not enter sensitive personal information anywhere on this site — treat it as a public demonstration, because that is what it is.",
            "We may remove accounts or reset the database at any time without warning.",
          ],
        },
        {
          title: "Availability",
          body: [
            "The site is provided as it is, with no guarantee that it will be online, correct or free of bugs. It runs on hobby-tier hosting and may be unavailable at any moment.",
          ],
        },
        {
          title: "Imagery and content",
          body: [
            "Product and editorial photography comes from Unsplash and is used under the Unsplash licence. The people shown in these images have no connection to this project and do not endorse it. The Obsidian name, layout and code are the work of Aleix Auqué.",
          ],
        },
        {
          title: "Contact",
          body: [
            "Questions, or a request to take something down: aleixauque@gmail.com.",
          ],
        },
      ]}
    />
  );
}
