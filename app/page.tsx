'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AuthError } from '@/components/AuthNotice';
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
    <main className="narrow auth-page">
      <div className="auth-brand">
        <h1>Kestrel Kids</h1>
        <p className="subtitle">Snow school portal</p>
      </div>

      <section data-testid="sign-in-form">
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
            {error && <AuthError testId="sign-in-error">{error}</AuthError>}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="sign-in-email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="sign-in-password" />
            </div>
            <button className="primary wide" type="submit" disabled={working} data-testid="sign-in-submit">{working ? 'Checking…' : 'Continue'}</button>
            <button type="button" className="text-link" onClick={() => { setError(null); setStep('forgot'); }} data-testid="forgot-password">Forgot your password?</button>
            <p className="small muted" style={{ marginTop: 12 }}>
              New here? Use the link in your email to create your password first.
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
              const { user, problem } = await refreshSession();
              if (!user) startOver(problem);
            })}
          >
            <h2>Enter your code</h2>
            <p className="small">We emailed a 6-digit code to {email}.</p>
            <div className="field">
              <label htmlFor="code">Code</label>
              <input id="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="······" data-testid="sign-in-code" />
            </div>
            {error && <AuthError testId="sign-in-error">{error}</AuthError>}
            <button className="primary wide" type="submit" disabled={working} data-testid="sign-in-code-submit">{working ? 'Signing in…' : 'Continue'}</button>
            <button type="button" className="text-link" onClick={() => startOver()}>Back</button>
          </form>
        )}

        {step === 'forgot' && (
          <form
            onSubmit={submit(async () => {
              await post('/api/auth/forgot', { email });
              setStep('forgot-sent');
            })}
          >
            <h2>Forgot password</h2>
            <p className="small">Enter your email and we’ll send a reset link.</p>
            <div className="field">
              <label htmlFor="forgot-email">Email</label>
              <input id="forgot-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email" />
            </div>
            <button className="primary wide" type="submit" disabled={working} data-testid="forgot-submit">{working ? 'Sending…' : 'Send reset link'}</button>
            <button type="button" className="text-link" onClick={() => startOver()}>Back to sign in</button>
          </form>
        )}

        {step === 'forgot-sent' && (
          <div data-testid="forgot-sent">
            <h2>Forgot password</h2>
            <div className="auth-notice ok" role="status">
              <span className="chip fill ok">Sent</span>
              <span>If that address has an account, a link to set a new password is on its way.</span>
            </div>
            <button type="button" className="text-link" onClick={() => startOver()}>Back to sign in</button>
          </div>
        )}
      </section>
    </main>
  );
}
