'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ROLE_HOME } from '@/components/Shell';
import { useStore } from '@/lib/store';

type Step = 'password' | 'code' | 'forgot' | 'forgot-sent';

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; restart?: boolean };
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, error: 'Couldn’t reach Peak Pals. Check your connection and try again.', restart: false };
  }
}

export default function SignIn() {
  const { me, refreshSession } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<Step>('password');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (me) router.replace(ROLE_HOME[me.role]);
  }, [me, router]);

  const startOver = (nextError: string | null = null) => {
    setStep('password');
    setPassword('');
    setCode('');
    setError(nextError);
  };

  const submit = (work: () => Promise<void>) => async (e: FormEvent) => {
    e.preventDefault();
    if (working) return;
    setWorking(true);
    setError(null);
    await work();
    setWorking(false);
  };

  return (
    <main className="narrow">
      <div style={{ textAlign: 'center', margin: '24px 0 20px' }}>
        <h1>Kestrel Kids Portal</h1>
        <p className="muted">The right information about each child, for the right people, at the right time.</p>
      </div>

      <section className="card" data-testid="sign-in-form">
        {step === 'password' && (
          <form
            onSubmit={submit(async () => {
              const result = await post('/api/auth/sign-in', { email, password });
              if (!result.ok) {
                setError(result.error ?? 'That didn’t work. Please try again.');
                return;
              }
              setPassword('');
              setStep('code');
            })}
          >
            <h2>Sign in</h2>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="sign-in-email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="sign-in-password" />
            </div>
            {error && <p className="field-error" role="alert" data-testid="sign-in-error">{error}</p>}
            <button className="primary big" type="submit" disabled={working} data-testid="sign-in-submit">{working ? 'Checking…' : 'Continue'}</button>
            <button type="button" className="ghost" style={{ marginTop: 8 }} onClick={() => { setError(null); setStep('forgot'); }} data-testid="forgot-password">Forgot your password?</button>
            <p className="small muted" style={{ marginTop: 12 }}>
              New here? Use the link in your welcome email to set your password first.
            </p>
          </form>
        )}

        {step === 'code' && (
          <form
            onSubmit={submit(async () => {
              const result = await post('/api/auth/code', { code });
              if (!result.ok) {
                if (result.restart) startOver(result.error ?? null);
                else setError(result.error ?? 'That didn’t work. Please try again.');
                return;
              }
              const person = await refreshSession();
              if (!person) startOver('Your sign-in isn’t linked to a Kestrel Kids account. Please contact the snow school office.');
            })}
          >
            <h2>Check your email</h2>
            <p>We sent a 6-digit code to <strong>{email}</strong>.</p>
            <div className="field">
              <label htmlFor="code">Code</label>
              <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value)} data-testid="sign-in-code" />
            </div>
            {error && <p className="field-error" role="alert" data-testid="sign-in-error">{error}</p>}
            <button className="primary big" type="submit" disabled={working} data-testid="sign-in-code-submit">{working ? 'Signing in…' : 'Sign in'}</button>
            <button type="button" className="ghost" style={{ marginTop: 8 }} onClick={() => startOver()}>Back</button>
          </form>
        )}

        {step === 'forgot' && (
          <form
            onSubmit={submit(async () => {
              await post('/api/auth/forgot', { email });
              setStep('forgot-sent');
            })}
          >
            <h2>Reset your password</h2>
            <div className="field">
              <label htmlFor="forgot-email">Email</label>
              <input id="forgot-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email" />
            </div>
            <button className="primary big" type="submit" disabled={working} data-testid="forgot-submit">{working ? 'Sending…' : 'Email me a link'}</button>
            <button type="button" className="ghost" style={{ marginTop: 8 }} onClick={() => startOver()}>Back</button>
          </form>
        )}

        {step === 'forgot-sent' && (
          <div data-testid="forgot-sent">
            <h2>Check your email</h2>
            <p>If that address has an account, a link to set a new password is on its way.</p>
            <button type="button" className="primary big" onClick={() => startOver()}>Back to sign in</button>
          </div>
        )}
      </section>
    </main>
  );
}
