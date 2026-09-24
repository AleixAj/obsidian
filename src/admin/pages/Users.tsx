import { useState, type FormEvent } from "react";
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
        push(`${form.name} was added. They can sign in with Google using ${form.email}.`);
        setForm({ name: "", email: "", role: "warehouse" });
      },
      onError: (error) => push(errorMessage(error, "Could not add this person."), "warn"),
    });
  }

  function handleRole(id: number, role: Role) {
    changeRole.mutate(
      { id, role },
      {
        onSuccess: () => push("Role updated."),
        onError: (error) => push(errorMessage(error, "Could not change the role."), "warn"),
      },
    );
  }

  function handleRemove(id: number, name: string) {
    if (!window.confirm(`Remove ${name} from the team? Their account stays, but without access to the panel.`)) return;
    removeStaff.mutate(id, {
      onSuccess: () => push(`${name} no longer has access.`),
      onError: (error) => push(errorMessage(error, "Could not remove this person."), "warn"),
    });
  }

  return (
    <>
      <PageHeader title="Users & roles" subtitle="Who can use the panel, and what each role can do" />

      {readOnly && (
        <div className="adm-note">
          You're using a shared demo account, so changes to the team are turned off. Otherwise anyone could give their own
          account admin access.
        </div>
      )}

      {isPending && <div className="adm-loading">Loading the team…</div>}
      {isError && <div className="adm-empty">Could not load the team.</div>}

      {data && (
        <>
          <section className="adm-card adm-table-card">
            <div className="adm-card-head adm-card-head--padded">
              <h2>Team · {data.data.length}</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--static">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Role</th>
                    <th>Last sign in</th>
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
                                {person.name} {isMe && <span className="adm-pill">You</span>}{" "}
                                {person.is_demo && <span className="adm-pill">Demo</span>}
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
                            aria-label={`Role of ${person.name}`}
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="adm-muted">{dateTime(person.last_login_at)}</td>
                        <td className="num">
                          {!isMe && !readOnly && (
                            <button type="button" className="adm-btn adm-btn--danger" onClick={() => handleRemove(person.id, person.name)}>
                              Remove
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
                <h2>What each role can do</h2>
              </div>
              <div className="adm-table-scroll">
                <table className="adm-table adm-table--plain adm-table--static adm-roles-table">
                  <thead>
                    <tr>
                      <th>Permission</th>
                      {data.roles.map((role) => (
                        <th key={role.value} className="num">
                          {role.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_LABELS).map(([permission, label]) => (
                      <tr key={permission}>
                        <td>{label}</td>
                        {data.roles.map((role) => (
                          <td key={role.value} className="num">
                            {role.permissions.includes(permission) ? (
                              <span className="adm-yes" aria-label="Yes">✓</span>
                            ) : (
                              <span className="adm-no" aria-label="No">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="adm-muted adm-small">The API checks these permissions on every request, not only this screen.</p>
            </section>

            <section className="adm-card adm-detail-side">
              <div className="adm-card-head">
                <h2>Add someone</h2>
              </div>
              <form className="adm-form" onSubmit={handleAdd}>
                <fieldset className="adm-fieldset adm-form" disabled={readOnly || addStaff.isPending}>
                  <label>
                    Name
                    <input className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
                  </label>
                  <label>
                    Email <small>they sign in with Google using it</small>
                    <input
                      className="adm-input"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                      required
                    />
                  </label>
                  <label>
                    Role
                    <select className="adm-input adm-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="adm-btn adm-btn--gold">
                    {addStaff.isPending ? "Adding…" : "Add to the team"}
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
