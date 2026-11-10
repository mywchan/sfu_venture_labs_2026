'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type From = { invite?: string; token?: string };

/** Opened from an email: "create your password" the first time, "reset" after that. */
export default function SetPassword() {
  const [from, setFrom] = useState<From | null>(null);
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Keeps a link already read, in case this runs twice after the address is cleared.
    setFrom((current) => (current?.invite || current?.token ? current : { invite: params.get('invite') ?? undefined, token: params.get('token') ?? undefined }));
    // The link is private, so take it out of the address bar and browser history.
    window.history.replaceState(null, '', '/set-password');
  }, []);

  const creating = Boolean(from?.invite);
  const hasLink = Boolean(from?.invite || from?.token);
  const title = creating ? 'Create your password' : 'Reset your password';

  return (
    <main className="narrow">
      <div style={{ textAlign: 'center', margin: '24px 0 20px' }}>
        <h1>Kestrel Kids Portal</h1>
      </div>
      <section className="card" data-testid="set-password">
        {from === null ? (
          <p className="muted">Loading…</p>
        ) : done ? (
          <div data-testid="set-password-done">
            <h2>{creating ? 'Your password is created' : 'Your password is reset'}</h2>
            <p>You can sign in now. We’ll email you a 6-digit code each time.</p>
            <Link className="btn primary" href="/">Go to sign in</Link>
          </div>
        ) : !hasLink ? (
          <div data-testid="set-password-no-link">
            <h2>This link isn’t complete</h2>
            <p>Open the link from your email again, or ask for a new one on the sign-in page.</p>
            <Link className="btn" href="/">Go to sign in</Link>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (saving) return;
              if (password !== again) {
                setError('Those two passwords don’t match.');
                return;
              }
              setSaving(true);
              setError(null);
              try {
                const res = await fetch('/api/auth/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...from, password }) });
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                if (res.ok) {
                  setPassword('');
                  setAgain('');
                  setDone(true);
                } else {
                  setError(body.error ?? 'That didn’t work. Please try again.');
                }
              } catch {
                setError('Couldn’t reach Peak Pals. Check your connection and try again.');
              } finally {
                setSaving(false);
              }
            }}
          >
            <h2 data-testid="set-password-title">{title}</h2>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={12} autoFocus value={password} onChange={(e) => setPassword(e.target.value)} data-testid="new-password" />
              <p className="small muted">At least 12 characters.</p>
            </div>
            <div className="field">
              <label htmlFor="new-password-again">Type it again</label>
              <input id="new-password-again" type="password" autoComplete="new-password" required value={again} onChange={(e) => setAgain(e.target.value)} data-testid="new-password-again" />
            </div>
            {error && <p className="field-error" role="alert" data-testid="set-password-error">{error}</p>}
            <button className="primary big" type="submit" disabled={saving} data-testid="set-password-save">{saving ? 'Saving…' : title}</button>
          </form>
        )}
      </section>
    </main>
  );
}
