'use client';

import { useEffect, useState } from 'react';
import { ROLE_LABEL } from '@/components/Shell';
import { fullName } from '@/lib/access';
import type { Role } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

type Row = { id: string; name: string; email: string; role: Role; childIds: string[] };
const ROLES: Role[] = ['parent', 'instructor', 'desk', 'patrol', 'admin'];

/** Administrator: who can sign in, and creating new accounts. */
export function AccountsTab() {
  const { data } = useStore();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('instructor');
  const [childIds, setChildIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/accounts', { cache: 'no-store' })
      .then(async (res) => {
        const body = (await res.json()) as { accounts?: Row[]; error?: string };
        if (!res.ok || !body.accounts) throw new Error(body.error);
        setRows(body.accounts);
      })
      .catch((err: Error) => setError(err.message || 'Couldn’t load accounts.'));
  }, []);

  const send = async (payload: Record<string, unknown>, done: string) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = (await res.json().catch(() => ({}))) as { accounts?: Row[]; error?: string };
      if (!res.ok || !body.accounts) throw new Error(body.error ?? 'That didn’t save. Please try again.');
      setRows(body.accounts);
      setNotice(done);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="accounts-tab">
      {error && <div className="banner danger" data-testid="accounts-error">{error}</div>}
      {notice && <div className="banner ok" data-testid="accounts-notice">{notice}</div>}
      <form
        className="card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (saving) return;
          const created = await send({ name, email, role, childIds: role === 'parent' ? childIds : [] }, `Create-password email sent to ${email.trim()}.`);
          if (created) {
            setName('');
            setEmail('');
            setChildIds([]);
          }
        }}
        data-testid="new-account-form"
      >
        <h2>Create an account</h2>
        <p className="small muted">The person gets an email with a link to create their password.</p>
        <div className="grid2">
          <div className="field"><label htmlFor="acct-name">Name</label><input id="acct-name" required value={name} onChange={(e) => setName(e.target.value)} data-testid="account-name" /></div>
          <div className="field"><label htmlFor="acct-email">Email</label><input id="acct-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="account-email" /></div>
          <div className="field">
            <label htmlFor="acct-role">Role</label>
            <select id="acct-role" value={role} onChange={(e) => setRole(e.target.value as Role)} data-testid="account-role">
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
        </div>
        {role === 'parent' && (
          <fieldset className="field" data-testid="account-children">
            <legend className="small">Their children</legend>
            {data.children.map((c) => (
              <label key={c.id} className="row small" style={{ gap: 6, fontWeight: 400 }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={childIds.includes(c.id)}
                  onChange={(e) => setChildIds((list) => (e.target.checked ? [...list, c.id] : list.filter((id) => id !== c.id)))}
                  data-testid={`account-child-${c.id}`}
                />
                {fullName(c)}
              </label>
            ))}
          </fieldset>
        )}
        <button className="primary" type="submit" disabled={saving} data-testid="account-save">{saving ? 'Creating…' : 'Create account'}</button>
      </form>

      <section className="card">
        <h2>Accounts{rows ? ` (${rows.length})` : ''}</h2>
        {!rows ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} data-testid="account-row">
                    <td><strong>{a.name}</strong></td>
                    <td className="small">{a.email}</td>
                    <td>{ROLE_LABEL[a.role]}</td>
                    <td className="row" style={{ gap: 6 }}>
                      <button type="button" className="ghost small" disabled={saving} onClick={() => void send({ action: 'resend', accountId: a.id }, `Password email sent to ${a.email}.`)}>Resend email</button>
                      <button
                        type="button"
                        className="ghost small"
                        style={{ color: 'var(--danger)' }}
                        disabled={saving}
                        onClick={() => {
                          if (window.confirm(`Remove ${a.name}'s access? They won't be able to sign in. To change a role, remove the account and create it again.`)) void send({ action: 'remove', accountId: a.id }, `${a.name}'s access has been removed.`);
                        }}
                        data-testid={`remove-account-${a.id}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
