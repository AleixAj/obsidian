import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/ui/Icon";
import { useAccount, useCreateAddress, useDeleteAddress, useUpdateAddress } from "../../hooks/queries";
import { apiErrorMessage, type AddressPayload, type ApiAddressDTO } from "../../lib/api";

/** The lines of an address card, skipping the empty ones. */
function addressLines(address: ApiAddressDTO): string[] {
  return [
    address.line1,
    address.line2,
    `${address.postal_code} ${address.city}${address.region ? `, ${address.region}` : ""}`,
    address.country,
    address.phone,
  ].filter(Boolean) as string[];
}

/** Starting values of the "new address" form. */
function emptyAddress(userName: string, isDefault: boolean, label: string): AddressPayload {
  return {
    label,
    full_name: userName,
    line1: "",
    line2: null,
    city: "",
    region: null,
    postal_code: "",
    country: "ES",
    phone: null,
    is_default: isDefault,
  };
}

/** An address from the API → the values of the edit form. */
function toAddressPayload(address: ApiAddressDTO): AddressPayload {
  return {
    label: address.label,
    full_name: address.full_name,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone,
    is_default: address.is_default,
  };
}

/** The saved addresses, and the form to add or edit one. */
export function Addresses() {
  const { t } = useTranslation("account");
  const { data: account, isPending, isError } = useAccount();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const accountAddresses = account?.addresses ?? [];
  const [editing, setEditing] = useState<{ id: number | null; values: AddressPayload } | null>(null);
  // Error from the API (e.g. a validation message).
  const [error, setError] = useState<string | null>(null);

  const isSaving = createAddress.isPending || updateAddress.isPending;

  const startNew = () =>
    setEditing({
      id: null,
      values: emptyAddress(
        account?.user.name ?? t("addresses.defaultName"),
        accountAddresses.length === 0,
        t("addresses.form.labelPlaceholder"),
      ),
    });

  const startEdit = (address: ApiAddressDTO) =>
    setEditing({
      id: address.id,
      values: toAddressPayload(address),
    });

  const patchEditing = (patch: Partial<AddressPayload>) => {
    setEditing((current) =>
      current ? { ...current, values: { ...current.values, ...patch } } : current,
    );
  };

  const saveEditing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    try {
      if (editing.id === null) {
        await createAddress.mutateAsync(editing.values);
      } else {
        await updateAddress.mutateAsync({ id: editing.id, payload: editing.values });
      }
      setEditing(null);
    } catch (err) {
      // Keep the form open so the user can fix what the server complained about.
      setError(apiErrorMessage(err) ?? t("addresses.saveFailed"));
    }
  };

  const makeDefault = (address: ApiAddressDTO) => {
    setError(null);
    updateAddress.mutate(
      { id: address.id, payload: { is_default: true } },
      { onError: (err) => setError(apiErrorMessage(err) ?? t("addresses.saveFailed")) },
    );
  };

  const removeAddress = (address: ApiAddressDTO) => {
    if (!window.confirm(t("addresses.confirmRemove"))) return;
    setError(null);
    deleteAddress.mutate(address.id, {
      onError: (err) => setError(apiErrorMessage(err) ?? t("addresses.removeFailed")),
    });
  };

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("addresses.eyebrow")}
          </div>
          <h1>
            {t("addresses.title1")}
            <span className="gold">{t("addresses.title2")}</span>
          </h1>
        </div>
      </div>

      {editing && (
        <form className="address-form settings-section" onSubmit={saveEditing}>
          <div className="head">
            <h4>{editing.id === null ? t("addresses.form.new") : t("addresses.form.edit")}</h4>
            <p>{t("addresses.form.saved")}</p>
          </div>
          <div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.label")}</label>
                <input
                  type="text"
                  value={editing.values.label ?? ""}
                  onChange={(e) => patchEditing({ label: e.target.value })}
                  placeholder={t("addresses.form.labelPlaceholder")}
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.fullName")}</label>
                <input
                  type="text"
                  value={editing.values.full_name}
                  onChange={(e) => patchEditing({ full_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>{t("addresses.form.line1")}</label>
              <input
                type="text"
                value={editing.values.line1}
                onChange={(e) => patchEditing({ line1: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>{t("addresses.form.line2")}</label>
              <input
                type="text"
                value={editing.values.line2 ?? ""}
                onChange={(e) => patchEditing({ line2: e.target.value || null })}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.city")}</label>
                <input
                  type="text"
                  value={editing.values.city}
                  onChange={(e) => patchEditing({ city: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.region")}</label>
                <input
                  type="text"
                  value={editing.values.region ?? ""}
                  onChange={(e) => patchEditing({ region: e.target.value || null })}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.postalCode")}</label>
                <input
                  type="text"
                  value={editing.values.postal_code}
                  onChange={(e) => patchEditing({ postal_code: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.country")}</label>
                <input
                  type="text"
                  value={editing.values.country}
                  onChange={(e) => patchEditing({ country: e.target.value.toUpperCase().slice(0, 2) })}
                  required
                  maxLength={2}
                />
              </div>
            </div>
            <div className="field">
              <label>{t("addresses.form.phone")}</label>
              <input
                type="tel"
                value={editing.values.phone ?? ""}
                onChange={(e) => patchEditing({ phone: e.target.value || null })}
              />
            </div>
            <label className={`checkbox-row ${editing.values.is_default ? "checked" : ""}`}>
              <span className="box">{editing.values.is_default && <span style={{ fontSize: 9 }}>✓</span>}</span>
              <input
                type="checkbox"
                checked={editing.values.is_default}
                onChange={(e) => patchEditing({ is_default: e.target.checked })}
                style={{ display: "none" }}
              />
              <span>{t("addresses.form.default")}</span>
            </label>
            {error && <div className="auth-error">{error}</div>}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t("addresses.form.saving") : t("addresses.form.save")} <Icon.Arrow />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEditing(null);
                  setError(null);
                }}
              >
                {t("addresses.form.cancel")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Errors from the card buttons (the form shows its own). */}
      {error && !editing && <div className="auth-error">{error}</div>}

      <div className="addr-grid">
        {isPending && <div className="data-error">{t("addresses.loading")}</div>}
        {isError && <div className="data-error">{t("addresses.error")}</div>}
        {accountAddresses.map((a) => (
          <div key={a.id} className={`addr-card ${a.is_default ? "default" : ""}`}>
            {a.is_default && <span className="badge">{t("addresses.badge")}</span>}
            <h4>{a.label ?? t("addresses.fallbackLabel")}</h4>
            <div className="name">{a.full_name}</div>
            <div className="lines">
              {addressLines(a).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <div className="actions">
              <a onClick={() => startEdit(a)}>{t("addresses.edit")}</a>
              {!a.is_default && (
                <a onClick={() => makeDefault(a)}>
                  {t("addresses.setDefault")}
                </a>
              )}
              <a style={{ color: "var(--accent-warn)" }} onClick={() => removeAddress(a)}>
                {t("addresses.remove")}
              </a>
            </div>
          </div>
        ))}
        <div className="addr-card add-new" onClick={startNew}>
          <span className="plus-big">+</span>
          <span>{t("addresses.addNew")}</span>
        </div>
      </div>
    </>
  );
}
