import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../hooks/queries";
import { mediaUrl } from "../../lib/api";
import type { Role } from "../api";
import { PageHeader } from "../components/PageHeader";
import { errorMessage } from "../errors";
import { dateTime, initials, PERMISSION_LABELS, ROLE_LABELS } from "../format";
import { useAddStaff, useChangeRole, useRemoveStaff, useTeam } from "../hooks";

const ROLES: Role[] = ["admin", "warehouse", "support"];

/**
 * Users & roles (admins only): who is in the team, what each role can do,
 * and adding or changing people.
 */
export function Users() {
  const { t } = useTranslation("admin");
  const { data: me } = useUser();
  const { data, isPending, isError } = useTeam();
  const addStaff = useAddStaff();
  const changeRole = useChangeRole();
  const removeStaff = useRemoveStaff();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", email: "", role: "warehouse" as Role });

  // The shared demo admin can look around but not change the team (the API blocks it too).
  const readOnly = me?.is_demo ?? true;

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    addStaff.mutate(form, {
      onSuccess: () => {
        push(t("users.added", { name: form.name, email: form.email }));
        setForm({ name: "", email: "", role: "warehouse" });
      },
      onError: (error) => push(errorMessage(error, t("users.addError")), "warn"),
    });
  }

  function handleRole(id: number, role: Role) {
    changeRole.mutate(
      { id, role },
      {
        onSuccess: () => push(t("users.roleUpdated")),
        onError: (error) => push(errorMessage(error, t("users.roleError")), "warn"),
      },
    );
  }

  function handleRemove(id: number, name: string) {
    if (!window.confirm(t("users.confirmRemove", { name }))) return;
    removeStaff.mutate(id, {
      onSuccess: () => push(t("users.removed", { name })),
      onError: (error) => push(errorMessage(error, t("users.removeError")), "warn"),
    });
  }

  return (
    <>
      <PageHeader title={t("users.title")} subtitle={t("users.subtitle")} />

      {readOnly && (
        <div className="adm-note">{t("users.readOnly")}</div>
      )}

      {isPending && <div className="adm-loading">{t("users.loading")}</div>}
      {isError && <div className="adm-empty">{t("users.loadError")}</div>}

      {data && (
        <>
          <section className="adm-card adm-table-card">
            <div className="adm-card-head adm-card-head--padded">
              <h2>{t("users.team", { total: data.data.length })}</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--static">
                <thead>
                  <tr>
                    <th>{t("users.person")}</th>
                    <th>{t("users.role")}</th>
                    <th>{t("users.lastSignIn")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((person) => {
                    const isMe = person.id === me?.id;
                    return (
                      <tr key={person.id}>
                        <td>
                          <div className="adm-product-cell">
                            <span className="adm-avatar adm-avatar--sm">
                              {person.avatar_url ? (
                                <img src={mediaUrl(person.avatar_url)} alt="" referrerPolicy="no-referrer" />
                              ) : (
                                initials(person.name)
                              )}
                            </span>
                            <div>
                              <span className="adm-strong">
                                {person.name} {isMe && <span className="adm-pill">{t("users.you")}</span>}{" "}
                                {person.is_demo && <span className="adm-pill">{t("users.demo")}</span>}
                              </span>
                              <small className="adm-cell-sub">{person.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className="adm-input adm-select"
                            value={person.role}
                            onChange={(e) => handleRole(person.id, e.target.value as Role)}
                            disabled={readOnly || isMe || changeRole.isPending}
                            aria-label={t("users.roleOf", { name: person.name })}
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {t(ROLE_LABELS[role])}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="adm-muted">{dateTime(person.last_login_at)}</td>
                        <td className="num">
                          {!isMe && !readOnly && (
                            <button type="button" className="adm-btn adm-btn--danger" onClick={() => handleRemove(person.id, person.name)}>
                              {t("users.remove")}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="adm-detail">
            <section className="adm-card adm-detail-main">
              <div className="adm-card-head">
                <h2>{t("users.whatEachRole")}</h2>
              </div>
              <div className="adm-table-scroll">
                <table className="adm-table adm-table--plain adm-table--static adm-roles-table">
                  <thead>
                    <tr>
                      <th>{t("users.permission")}</th>
                      {data.roles.map((role) => (
                        <th key={role.value} className="num">
                          {t(ROLE_LABELS[role.value])}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_LABELS).map(([permission, label]) => (
                      <tr key={permission}>
                        <td>{t(label)}</td>
                        {data.roles.map((role) => (
                          <td key={role.value} className="num">
                            {role.permissions.includes(permission) ? (
                              <span className="adm-yes" aria-label={t("common.yes")}>✓</span>
                            ) : (
                              <span className="adm-no" aria-label={t("common.no")}>—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="adm-muted adm-small">{t("users.apiChecks")}</p>
            </section>

            <section className="adm-card adm-detail-side">
              <div className="adm-card-head">
                <h2>{t("users.addSomeone")}</h2>
              </div>
              <form className="adm-form" onSubmit={handleAdd}>
                <fieldset className="adm-fieldset adm-form" disabled={readOnly || addStaff.isPending}>
                  <label>
                    {t("users.name")}
                    <input className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
                  </label>
                  <label>
                    <span className="adm-label-row">
                      {t("users.email")} <small>{t("users.emailHint")}</small>
                    </span>
                    <input
                      className="adm-input"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                      required
                    />
                  </label>
                  <label>
                    {t("users.role")}
                    <select className="adm-input adm-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {t(ROLE_LABELS[role])}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="adm-btn adm-btn--gold">
                    {addStaff.isPending ? t("users.adding") : t("users.add")}
                  </button>
                </fieldset>
              </form>
            </section>
          </div>
        </>
      )}
    </>
  );
}
