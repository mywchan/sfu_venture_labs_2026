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
      <p className="muted">Changes you make here reach the desk, your child’s instructor and ski patrol right away.</p>
      <div data-testid="parent-children">
        {kids.map((c) => {
          const missing = missingInfo(data, c.id);
          const group = groupOfChild(data, c.id);
          return (
            <Link key={c.id} href={`/parent/${c.id}`} className="card" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }} data-testid={`parent-child-${c.id}`}>
              <div className="row between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fullName(c)}</div>
                  <div className="small muted">
                    Age {ageOn(c.birthDate, TODAY)} · Level {c.level} · {c.programDay}s{group ? ` · ${group.name}` : ''}
                  </div>
                </div>
                {missing.length === 0 ? <span className="chip ok">All set</span> : <span className="chip warn">{missing.length} to finish</span>}
              </div>
              {missing.length > 0 && <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>Still needed: {missing.join(', ').toLowerCase()}</p>}
            </Link>
          );
        })}
      </div>
    </>
  );
}
