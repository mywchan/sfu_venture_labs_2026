'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE_HOME, ROLE_LABEL } from '@/components/Shell';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/seed/data';

const PREVIEW_CODE = '123456';

export default function SignIn() {
  const { data, me, signIn } = useStore();
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

  const go = (id: string) => {
    const u = data.users.find((x) => x.id === id)!;
    signIn(id);
    router.push(ROLE_HOME[u.role]);
  };

  const roles: Role[] = ['parent', 'instructor', 'desk', 'patrol', 'admin'];

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
              <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="sign-in-email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="sign-in-password" />
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
              go(user!.id);
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
        {roles.map((role) => (
          <div key={role} style={{ marginBottom: 12 }}>
            <h3 className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ROLE_LABEL[role]}</h3>
            <div className="stack">
              {data.users
                .filter((u) => u.role === role)
                .map((u) => (
                  <button key={u.id} type="button" onClick={() => go(u.id)} data-testid={`demo-${u.id}`}>
                    <span>{u.name}</span>
                    <span className="small muted">{demoHint[u.id] ?? ''}</span>
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
  'u-mei': 'Check-in and pickup',
  'u-rob': 'Patrol director',
  'u-kai': 'Patroller',
  'u-hana': 'Snow school director',
};
