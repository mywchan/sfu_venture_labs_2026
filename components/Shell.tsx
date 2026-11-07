'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/seed/data';

export const ROLE_HOME: Record<Role, string> = {
  parent: '/parent',
  instructor: '/instructor',
  desk: '/desk',
  patrol: '/patrol',
  admin: '/admin',
};

export const ROLE_LABEL: Record<Role, string> = {
  parent: 'Parent',
  instructor: 'Instructor',
  desk: 'Desk',
  patrol: 'Patrol',
  admin: 'Administrator',
};

/** Page frame for a signed-in role. Anyone of another role is sent to their own screens. */
export function Shell({ role, narrow, children }: { role: Role; narrow?: boolean; children: ReactNode }) {
  const { me, now, signOut } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!me) router.replace('/');
    else if (me.role !== role) router.replace(ROLE_HOME[me.role]);
  }, [me, role, router]);

  if (!me || me.role !== role) return <main className="narrow muted">Loading…</main>;

  return (
    <>
      <header className="topbar" data-testid="topbar">
        <span className="brand">Kestrel Kids</span>
        <span className="role-badge" data-testid="role-badge">{ROLE_LABEL[me.role]}</span>
        <span className="who" data-testid="signed-in-as">{me.name}</span>
        <span className="spacer" />
        <span className="clock" title="Demo clock" data-testid="demo-clock">
          Sat Dec 12 · {now.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}
        </span>
        <button
          type="button"
          data-testid="switch-person"
          onClick={() => {
            signOut();
            router.push('/');
          }}
        >
          Sign out
        </button>
      </header>
      <main className={narrow ? 'narrow' : undefined}>{children}</main>
    </>
  );
}
