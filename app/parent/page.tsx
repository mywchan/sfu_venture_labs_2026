'use client';

import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { ageOn, childrenForParent, fullName, groupOfChild, missingInfo } from '@/lib/access';
import { TODAY } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function ParentHome() {
  return (
    <Shell role="parent" narrow>
      <ParentChildren />
    </Shell>
  );
}

function ParentChildren() {
  const { data, me } = useStore();
  const kids = childrenForParent(data, me!);

  return (
    <>
      <h1>Your children</h1>
      <p className="subtitle">{me!.name}</p>
      <p className="muted small">Changes you make here reach the desk, your child’s instructor and ski patrol right away.</p>
      <div data-testid="parent-children">
        {kids.map((c) => {
          const missing = missingInfo(data, c.id);
          const group = groupOfChild(data, c.id);
          return (
            <Link key={c.id} href={`/parent/${c.id}`} className="card light" style={{ display: 'block', textDecoration: 'none', padding: 'var(--space-lg)' }} data-testid={`parent-child-${c.id}`}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-body-lg)' }}>{fullName(c)}</div>
              <div>Age {ageOn(c.birthDate, TODAY)} · Level {c.level}</div>
              <div>{c.programDay}s{group ? ` · ${group.name}` : ''}</div>
              <div className="row" style={{ gap: 'var(--space-sm)', margin: '8px 0 12px' }}>
                {missing.length === 0 ? <span className="chip fill ok">All set</span> : <span className="chip fill warn">{missing.length} to finish</span>}
                {missing.length > 0 && <span className="small">Still needed: {missing.join(', ').toLowerCase()}</span>}
              </div>
              <span className="btn black wide">Open {c.firstName}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
