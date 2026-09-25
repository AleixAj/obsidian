import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteAvatar, useUploadAvatar, useUser } from "../../hooks/queries";
import { ApiError, AVATAR_MAX_MB, AVATAR_TYPES, mediaUrl } from "../../lib/api";

/**
 * "Profile photo" block of the account settings.
 *
 * If the user signed in with Google, their Google photo is shown by default.
 * They can upload their own (JPG, PNG or WebP, up to 2 MB) or remove it
 * to go back to the Google photo / initials.
 */
export function ProfilePhoto() {
  const { t } = useTranslation("account");
  const { data: user } = useUser();
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const photo = mediaUrl(user.avatar_url);
  const busy = upload.isPending || remove.isPending;

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again still works.
    event.target.value = "";
    if (!file) return;

    // Quick checks here, so the user doesn't wait for an upload that will fail.
    if (!AVATAR_TYPES.includes(file.type)) {
      setError(t("photo.errors.type"));
      return;
    }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
      setError(t("photo.errors.size", { mb: AVATAR_MAX_MB }));
      return;
    }

    setError(null);
    upload.mutate(file, {
      onError: (err) => {
        const payload = err instanceof ApiError ? (err.payload as { message?: string } | undefined) : undefined;
        setError(payload?.message ?? t("photo.errors.upload"));
      },
    });
  }

  return (
    <div className="settings-section">
      <div className="head">
        <h4>{t("photo.title")}</h4>
        <p>
          {user.oauth_provider === "google"
            ? t("photo.google")
            : t("photo.shown")}{" "}
          {t("photo.formats", { mb: AVATAR_MAX_MB })}
        </p>
      </div>

      <div className="profile-photo">
        <div className="profile-photo-preview">
          {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
        </div>

        {user.is_demo ? (
          <p className="profile-photo-note">{t("photo.demo")}</p>
        ) : (
          <div className="profile-photo-actions">
            <input ref={fileInput} type="file" accept={AVATAR_TYPES.join(",")} hidden onChange={handleFile} />
            <button type="button" className="btn-submit" onClick={() => fileInput.current?.click()} disabled={busy}>
              {upload.isPending ? t("photo.uploading") : t("photo.upload")}
            </button>
            {user.has_uploaded_avatar && (
              <button type="button" className="social-btn" onClick={() => remove.mutate()} disabled={busy}>
                {user.oauth_provider === "google" ? t("photo.useGoogle") : t("photo.remove")}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
