'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import {
  adultsFor,
  ageOn,
  formatPhone,
  fullName,
  groupOfChild,
  ordinal,
  parentOwnsChild,
  phoneProblem,
  timeLabel,
  todaysAttendance,
  userName,
} from '@/lib/access';
import { TODAY, type ChildPerson, type MedicalAlert, type Person, type Severity } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function ParentChildPage() {
  return (
    <Shell role="parent" narrow>
      <ChildDetail />
    </Shell>
  );
}

type Tab = 'today' | 'adults' | 'medical' | 'consent';

function ChildDetail() {
  const { childId } = useParams<{ childId: string }>();
  const { data, me } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const child = data.children.find((c) => c.id === childId);

  // A parent can only open their own children. Anything else looks like it doesn't exist.
  if (!child || !parentOwnsChild(data, me!, childId)) {
    return (
      <div className="card" data-testid="not-found">
        <h1>Not found</h1>
        <p>We couldn’t find that child on your account.</p>
        <Link href="/parent">Back to your children</Link>
      </div>
    );
  }

  const tabs: [Tab, string][] = [
    ['today', 'Lessons'],
    ['adults', 'Contacts & pickup'],
    ['medical', 'Medical'],
    ['consent', 'Consent form'],
  ];

  return (
    <>
      <Link href="/parent" className="small">← Your children</Link>
      <h1 style={{ marginTop: 8 }} data-testid="child-name">{fullName(child)}</h1>
      <p className="muted">Age {ageOn(child.birthDate, TODAY)} · Level {child.level} · {child.programDay}s · Order {child.orderNumber}</p>
      <div className="tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} data-testid={`tab-${id}`}>{label}</button>
        ))}
      </div>
      {tab === 'today' && <LessonsTab childId={child.id} />}
      {tab === 'adults' && <AdultsTab childId={child.id} />}
      {tab === 'medical' && <MedicalTab childId={child.id} />}
      {tab === 'consent' && <ConsentTab childId={child.id} />}
    </>
  );
}

function LessonsTab({ childId }: { childId: string }) {
  const { data } = useStore();
  const group = groupOfChild(data, childId);
  const att = todaysAttendance(data, childId);
  const pickedUpBy = data.persons.find((p) => p.id === att?.pickedUpBy);
  return (
    <div className="card" data-testid="lessons-tab">
      <h2>Today · Saturday, December 12</h2>
      <dl className="kv">
        <dt>Group</dt>
        <dd data-testid="lesson-group">{group ? `${group.name} · level ${group.level} · ${userName(data, group.instructorId)}` : 'Not placed yet'}</dd>
        <dt>Checked in</dt>
        <dd data-testid="lesson-checkin">{att?.checkInAt ? timeLabel(att.checkInAt) : 'Not yet'}</dd>
        <dt>Picked up</dt>
        <dd data-testid="lesson-pickup">{att?.pickupAt ? `${timeLabel(att.pickupAt)} by ${att.pickedUpName ?? pickedUpBy?.name ?? '—'}` : 'Not yet'}</dd>
      </dl>
      <h3 style={{ marginTop: 16 }}>Lesson days</h3>
      <ul className="small">
        {data.lessonDays.map((d) => (
          <li key={d.id}>{new Date(d.date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</li>
        ))}
      </ul>
    </div>
  );
}

function AdultsTab({ childId }: { childId: string }) {
  const { data, removeLink, guardianLink } = useStore();
  const [editing, setEditing] = useState<{ link?: ChildPerson; person?: Person } | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const adults = adultsFor(data, childId);

  const remove = async (linkId: string) => {
    setRemoving(linkId);
    setRemoveError(null);
    try {
      await removeLink(linkId);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'That didn’t save. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="stack" data-testid="adults-tab">
      <p className="muted small">Add anyone who may be called in an emergency or may pick your child up. Different last names are fine.</p>
      <div data-testid="guardian-link">
        {guardianLink === 'connected' && <span className="chip ok">Connected to Peak Pals</span>}
        {guardianLink === 'checking' && <span className="chip">Connecting…</span>}
        {guardianLink === 'offline' && <span className="chip warn">Not connected: changes can’t be saved right now</span>}
      </div>
      {removeError && <div className="banner danger" data-testid="remove-error">{removeError}</div>}
      {adults.map(({ link, person }) => (
        <div className="card" key={link.id} data-testid={`adult-${person.name}`}>
          <div className="row between">
            <div>
              <div style={{ fontWeight: 700 }}>{person.name} <span className="muted small">({link.relationship})</span></div>
              <div className="small">{person.phone}{person.email ? ` · ${person.email}` : ''}</div>
            </div>
            <div className="row">
              {link.contactOrder && <span className="chip">Emergency contact {link.contactOrder}</span>}
              {link.canPickUp ? <span className="chip ok">Can pick up</span> : <span className="chip">No pickup</span>}
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button type="button" onClick={() => setEditing({ link, person })}>Edit</button>
            <button type="button" className="ghost" disabled={removing === link.id} onClick={() => remove(link.id)}>{removing === link.id ? 'Removing…' : 'Remove'}</button>
          </div>
        </div>
      ))}
      {editing ? (
        <AdultForm childId={childId} initial={editing} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="primary" onClick={() => setEditing({})} data-testid="add-adult">+ Add an adult</button>
      )}
    </div>
  );
}

let personN = 0;

function AdultForm({ childId, initial, onDone }: { childId: string; initial: { link?: ChildPerson; person?: Person }; onDone: () => void }) {
  const { data, savePerson } = useStore();
  // One more position than there are other emergency contacts: with 2 already, a 3rd is offered, and so on.
  const otherContacts = adultsFor(data, childId).filter((x) => x.link.contactOrder !== null && x.link.id !== initial.link?.id).length;
  const positions = Array.from({ length: otherContacts + 1 }, (_, i) => i + 1);
  const [name, setName] = useState(initial.person?.name ?? '');
  const [relationship, setRelationship] = useState(initial.link?.relationship ?? '');
  const [phone, setPhone] = useState(initial.person?.phone ?? '');
  const [email, setEmail] = useState(initial.person?.email ?? '');
  const [order, setOrder] = useState<string>(initial.link?.contactOrder ? String(initial.link.contactOrder) : '');
  const [canPickUp, setCanPickUp] = useState(initial.link?.canPickUp ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  return (
    <form
      className="card"
      data-testid="adult-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (saving) return;
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Enter a name.';
        if (!relationship.trim()) errs.relationship = 'Say how they are related, for example Grandmother.';
        const p = phoneProblem(phone);
        if (p) errs.phone = p;
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setSaving(true);
        setSaveError(null);
        try {
          await savePerson(
            childId,
            { id: initial.person?.id ?? `p-new-${++personN}`, name: name.trim(), phone: formatPhone(phone), email: email.trim() },
            { relationship: relationship.trim(), contactOrder: order ? Number(order) : null, canPickUp },
            initial.link?.id,
          );
          onDone();
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : 'That didn’t save. Please try again.');
          setSaving(false);
        }
      }}
    >
      <h2>{initial.person ? 'Edit adult' : 'Add an adult'}</h2>
      <div className="grid2">
        <div className="field">
          <label htmlFor="a-name">Full name</label>
          <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} data-testid="adult-name" />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="field">
          <label htmlFor="a-rel">Relationship to child</label>
          <input id="a-rel" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Grandmother, uncle, nanny…" data-testid="adult-relationship" />
          {errors.relationship && <div className="field-error">{errors.relationship}</div>}
        </div>
        <div className="field">
          <label htmlFor="a-phone">Phone</label>
          <input id="a-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="adult-phone" />
          {errors.phone && <div className="field-error" data-testid="phone-error">{errors.phone}</div>}
        </div>
        <div className="field">
          <label htmlFor="a-email">Email (optional)</label>
          <input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="a-order">Emergency contact</label>
          <select id="a-order" value={order} onChange={(e) => setOrder(e.target.value)} data-testid="adult-order">
            <option value="">Not an emergency contact</option>
            {positions.map((n) => (
              <option key={n} value={n}>{ordinal(n)} emergency contact</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ alignSelf: 'end' }}>
          <label className="checkbox">
            <input type="checkbox" checked={canPickUp} onChange={(e) => setCanPickUp(e.target.checked)} data-testid="adult-can-pickup" />
            Allowed to pick up
          </label>
        </div>
      </div>
      {saveError && <div className="banner danger" data-testid="adult-save-error">{saveError}</div>}
      <div className="row">
        <button className="primary" type="submit" disabled={saving} data-testid="adult-save">{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

function MedicalTab({ childId }: { childId: string }) {
  const { data, setNoMedical, removeMedical } = useStore();
  const child = data.children.find((c) => c.id === childId)!;
  const alerts = data.medical.filter((m) => m.childId === childId);
  const [editing, setEditing] = useState<MedicalAlert | 'new' | null>(null);

  return (
    <div className="stack" data-testid="medical-tab">
      <p className="muted small">
        Your child’s instructor sees the <strong>short alert</strong> at a glance. The details open only with a tap, and each look is recorded. The desk never sees medical information.
      </p>
      {alerts.map((m) => (
        <div className="card" key={m.id}>
          <div className={`alert-line ${m.severity}`}>{m.shortAlert}</div>
          <p className="small" style={{ marginTop: 8 }}>{m.details}</p>
          <p className="small muted">Medication kept: {m.medicationLocation}</p>
          <div className="row">
            <button type="button" onClick={() => setEditing(m)}>Edit</button>
            <button type="button" className="ghost" onClick={() => removeMedical(m.id)}>Remove</button>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <label className="checkbox card">
          <input type="checkbox" checked={child.noMedicalConditions} onChange={(e) => setNoMedical(childId, e.target.checked)} data-testid="no-medical" />
          {child.firstName} has no allergies, medical conditions or medications
        </label>
      )}
      {editing ? (
        <MedicalForm childId={childId} initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="primary" onClick={() => setEditing('new')} data-testid="add-medical">+ Add an allergy or condition</button>
      )}
    </div>
  );
}

function MedicalForm({ childId, initial, onDone }: { childId: string; initial: MedicalAlert | null; onDone: () => void }) {
  const { saveMedical } = useStore();
  const [shortAlert, setShortAlert] = useState(initial?.shortAlert ?? '');
  const [details, setDetails] = useState(initial?.details ?? '');
  const [med, setMed] = useState(initial?.medicationLocation ?? '');
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'high');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="card"
      data-testid="medical-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!shortAlert.trim()) {
          setError('Write the short alert the instructor should see.');
          return;
        }
        saveMedical({ childId, shortAlert: shortAlert.trim(), details: details.trim(), medicationLocation: med.trim() || 'None', severity }, initial?.id);
        onDone();
      }}
    >
      <h2>{initial ? 'Edit' : 'Add an allergy or condition'}</h2>
      <div className="field">
        <label htmlFor="m-short">Short alert for the instructor</label>
        <input id="m-short" value={shortAlert} onChange={(e) => setShortAlert(e.target.value)} placeholder="Tree nut allergy, EpiPen in backpack" data-testid="medical-short" />
        <div className="small muted">Say what it is and what to do, in one line.</div>
        {error && <div className="field-error">{error}</div>}
      </div>
      <div className="field">
        <label htmlFor="m-details">Details</label>
        <textarea id="m-details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} data-testid="medical-details" />
      </div>
      <div className="grid2">
        <div className="field">
          <label htmlFor="m-med">Where medication is kept</label>
          <input id="m-med" value={med} onChange={(e) => setMed(e.target.value)} placeholder="Backpack, front pocket" />
        </div>
        <div className="field">
          <label htmlFor="m-sev">How serious</label>
          <select id="m-sev" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)} data-testid="medical-severity">
            <option value="high">Life-threatening</option>
            <option value="medium">Needs attention</option>
            <option value="low">Good to know</option>
          </select>
        </div>
      </div>
      <div className="row">
        <button className="primary" type="submit" data-testid="medical-save">Save</button>
        <button type="button" className="ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

function ConsentTab({ childId }: { childId: string }) {
  const { data, me, signConsent } = useStore();
  const existing = data.consents.find((c) => c.childId === childId);
  const [photo, setPhoto] = useState(existing?.photoConsent ?? false);
  const [agree, setAgree] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="card" data-testid="consent-signed">
        <div className="banner ok">Consent form signed</div>
        <dl className="kv">
          <dt>Signed by</dt>
          <dd>{existing.signedBy}</dd>
          <dt>Date</dt>
          <dd>{existing.signedDate}</dd>
          <dt>Photo</dt>
          <dd>{existing.photoConsent ? 'Staff and patrol may see a photo' : 'No photo'}</dd>
        </dl>
      </div>
    );
  }

  return (
    <form
      className="card"
      data-testid="consent-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!agree || !signature.trim()) {
          setError('Tick the box and type your full name to sign.');
          return;
        }
        signConsent({ childId, signedBy: signature.trim(), signedDate: '2026-12-12', photoConsent: photo });
      }}
    >
      <h2>Consent form</h2>
      <p className="small">
        I agree that Kestrel Kids may use the information on this account to keep my child safe during lessons: to tell their instructor about medical alerts, to check who picks them up, and to give ski patrol everything they need if my child goes missing. In an emergency, details may be shared with police and search and rescue.
      </p>
      <label className="checkbox field">
        <input type="checkbox" checked={photo} onChange={(e) => setPhoto(e.target.checked)} data-testid="consent-photo" />
        Staff and patrol may see a photo of my child (optional)
      </label>
      <label className="checkbox field">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} data-testid="consent-agree" />
        I agree to the above
      </label>
      <div className="field">
        <label htmlFor="sig">Type your full name to sign</label>
        <input id="sig" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder={me?.name} data-testid="consent-signature" />
      </div>
      {error && <p className="field-error">{error}</p>}
      <button className="primary" type="submit" data-testid="consent-submit">Sign consent form</button>
    </form>
  );
}
