import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfilePhoto } from "../../components/account/ProfilePhoto";
import { Icon } from "../../components/ui/Icon";
import { useUpdateUser, useUser } from "../../hooks/queries";

/** Profile photo, name and email, and the notification switches. */

export function Settings() {
  const { t } = useTranslation("account");
  const { data: user } = useUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    drops: true,
    updates: true,
    backInStock: true,
    newsletter: false,
    birthday: true,
  });

  // The title of each one is in account.json, under "settings.notifications".
  const NOTIFICATIONS: { key: keyof typeof toggles; channels: string }[] = [
    { key: "drops", channels: "SMS · Email" },
    { key: "updates", channels: "Email · WhatsApp" },
    { key: "backInStock", channels: "Email" },
    { key: "newsletter", channels: "Email" },
    { key: "birthday", channels: "Email" },
  ];

  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ");

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await updateUser.mutateAsync({ name: name.trim() || t("addresses.defaultName"), email });
      setProfileMessage(t("settings.profile.saved"));
    } catch {
      // The shared demo account can't change its name or email (API answers 403).
      setProfileMessage(user?.is_demo ? t("settings.profile.demoLocked") : t("settings.profile.saveFailed"));
    }
  };

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("settings.eyebrow")}
          </div>
          <h1>
            <span className="gold">{t("settings.title")}</span>
          </h1>
        </div>
      </div>

      <ProfilePhoto />

      <form className="settings-section" onSubmit={submitProfile}>
        <div className="head">
          <h4>{t("settings.profile.title")}</h4>
          <p>{t("settings.profile.text")}</p>
        </div>
        <div>
          <div className="field-row">
            <div className="field">
              <label>{t("settings.profile.firstName")}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setName([e.target.value, lastName].filter(Boolean).join(" "))}
                required
              />
            </div>
            <div className="field">
              <label>{t("settings.profile.lastName")}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setName([firstName, e.target.value].filter(Boolean).join(" "))}
              />
            </div>
          </div>
          <div className="field">
            <label>{t("settings.profile.email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>{t("settings.profile.phone")}</label>
            <input type="tel" placeholder="+34 612 345 678" disabled />
          </div>
          {profileMessage && <div className="auth-error" style={{ color: "var(--gold)" }}>{profileMessage}</div>}
          {updateUser.isError && <div className="auth-error">{t("settings.profile.error")}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={updateUser.isPending}>
              {updateUser.isPending ? t("settings.profile.saving") : t("settings.profile.save")} <Icon.Arrow />
            </button>
          </div>
        </div>
      </form>

      <div className="settings-section">
        <div className="head">
          <h4>{t("settings.notifications.title")}</h4>
          <p>{t("settings.notifications.text")}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t(`settings.notifications.${n.key}`)}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                    marginTop: 2,
                  }}
                >
                  {n.channels}
                </div>
              </div>
              <button
                type="button"
                className={`toggle ${toggles[n.key] ? "on" : ""}`}
                aria-pressed={toggles[n.key]}
                onClick={() => setToggles((current) => ({ ...current, [n.key]: !current[n.key] }))}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
