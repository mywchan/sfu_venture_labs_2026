'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE_HOME, ROLE_LABEL } from '@/components/Shell';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/seed/data';

// Presentation version (dev branch): the first prototype's sign-in, with a few
// accounts per role for quick switching. No real password or emailed code.
const PREVIEW_CODE = '123456';

export default function SignIn() {
  const { data, me, refreshSession } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me) router.replace(ROLE_HOME[me.role]);
  }, [me, router]);

  const user = data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  const go = async (id: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id }) });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'That account couldn’t be opened.');
        return;
      }
      const { user: signedIn, problem } = await refreshSession();
      if (!signedIn) setError(problem);
    } catch {
      setError('That account couldn’t be opened. Please try again.');
    }
  };

  const roles: Role[] = ['parent', 'instructor', 'desk', 'patrol', 'admin'];
  const quickAccounts = data.users.filter((u) => demoHint[u.id] !== undefined);

  return (
    <main className="narrow">
      <div style={{ textAlign: 'center', margin: '24px 0 20px' }}>
        <h1>Kestrel Kids Portal</h1>
        <p className="muted">The right information about each child, for the right people, at the right time.</p>
      </div>

      <section className="card" data-testid="sign-in-form">
        {step === 'password' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!user || !password) {
                setError('That email and password don’t match an account.');
                return;
              }
              setError(null);
              setStep('code');
            }}
          >
            <h2>Sign in</h2>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="sign-in-email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="sign-in-password" />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="primary big" type="submit" data-testid="sign-in-submit">Continue</button>
            <p className="small muted" style={{ marginTop: 12 }}>
              New parents get a welcome email after registering in the store, with a link to set their password.
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim() !== PREVIEW_CODE) {
                setError('That code isn’t right. Check the latest email from Kestrel Kids.');
                return;
              }
              void go(user!.id);
            }}
          >
            <h2>Check your email</h2>
            <p>We sent a 6-digit code to <strong>{user?.email}</strong>.</p>
            <div className="field">
              <label htmlFor="code">Code</label>
              <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} data-testid="sign-in-code" />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="primary big" type="submit" data-testid="sign-in-code-submit">Sign in</button>
            <p className="small muted" style={{ marginTop: 12 }}>Preview: no email is sent. The code is {PREVIEW_CODE}.</p>
            <button type="button" className="ghost" onClick={() => { setStep('password'); setCode(''); setError(null); }}>Back</button>
          </form>
        )}
      </section>

      <section className="card demo-accounts" data-testid="demo-accounts">
        <h2>Try the preview as…</h2>
        <p className="small muted">Skip sign-in and jump straight into any role.</p>
        {step === 'password' && error && quickAccounts.length > 0 && !email && <p className="field-error">{error}</p>}
        {roles.map((role) => (
          <div key={role} style={{ marginBottom: 12 }}>
            <h3 className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ROLE_LABEL[role]}</h3>
            <div className="stack">
              {quickAccounts
                .filter((u) => u.role === role)
                .map((u) => (
                  <button key={u.id} type="button" onClick={() => void go(u.id)} data-testid={`demo-${u.id}`}>
                    <span>{u.name}</span>
                    <span className="small muted">{demoHint[u.id]}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const demoHint: Record<string, string> = {
  'u-melissa': "Owen's mother",
  'u-jun': "Lily's mother",
  'u-claire': "Ava's mother",
  'u-fatima': "Zoe's mother · form not signed",
  'u-sam': 'Group A · level 3',
  'u-priya': 'Group B · level 1',
  'u-jordan': 'Group C · level 5',
  'u-alex': 'No group yet',
  'u-mei': 'Check-in and pickup',
  'u-rob': 'Patrol director',
  'u-kai': 'Patroller',
  'u-hana': 'Snow school director',
};
