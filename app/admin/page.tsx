'use client';

import { useState } from 'react';
import { AccountsTab } from '@/components/AccountsTab';
import { ReportMissing } from '@/components/ReportMissing';
import { ROLE_LABEL, Shell } from '@/components/Shell';
import { ageOn, fullName, groupOfChild, missingInfo, openSearchFor, timeLabel, todayLabel, todaysAttendance, userName } from '@/lib/access';
import { TODAY, TODAY_LESSON_DAY, type Child } from '@/lib/seed/data';
import { useStore, type ImportRow } from '@/lib/store';

export default function AdminHome() {
  return (
    <Shell role="admin">
      <Admin />
    </Shell>
  );
}

type Tab = 'missing' | 'groups' | 'children' | 'accounts' | 'access' | 'upload';

function Admin() {
  const [tab, setTab] = useState<Tab>('missing');
  const tabs: [Tab, string][] = [
    ['missing', 'Missing information'],
    ['groups', 'Groups'],
    ['children', 'Children'],
    ['accounts', 'Accounts'],
    ['access', 'Access record'],
    ['upload', 'Store spreadsheet'],
  ];
  return (
    <>
      <h1>Snow school office</h1>
      <div className="tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}>{label}</button>
        ))}
      </div>
      {tab === 'missing' && <MissingTab />}
      {tab === 'groups' && <GroupsTab />}
      {tab === 'children' && <ChildrenTab />}
      {tab === 'accounts' && <AccountsTab />}
      {tab === 'access' && <AccessTab />}
      {tab === 'upload' && <UploadTab />}
    </>
  );
}

function MissingTab() {
  const { data } = useStore();
  const rows = data.children.map((c) => ({ c, missing: missingInfo(data, c.id) })).filter((r) => r.missing.length > 0);
  return (
    <section className="card" data-testid="missing-list">
      <h2>{rows.length === 0 ? 'Every child’s information is complete' : `${rows.length} of ${data.children.length} children are missing information`}</h2>
      {rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Child</th><th>Day</th><th>Missing</th></tr></thead>
            <tbody>
              {rows.map(({ c, missing }) => (
                <tr key={c.id} data-testid={`missing-${c.id}`}>
                  <td><strong>{fullName(c)}</strong></td>
                  <td>{c.programDay}</td>
                  <td>{missing.map((m) => <span key={m} className="chip warn" style={{ marginRight: 4, marginBottom: 4 }}>{m}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const MAX_GROUP = 6;

function GroupsTab() {
  const { data, moveChild, addGroup } = useStore();
  const groups = data.groups.filter((g) => g.lessonDayId === TODAY_LESSON_DAY);
  const instructors = data.users.filter((u) => u.role === 'instructor');
  const unplaced = data.children.filter((c) => c.programDay === 'Saturday' && !groupOfChild(data, c.id));
  const [name, setName] = useState('');
  const [level, setLevel] = useState(2);
  // Starts on an instructor who is free today, so Create group works straight away.
  const [pickedInstructor, setInstructorId] = useState('');
  const instructorId = pickedInstructor || (instructors.find((u) => !groups.some((g) => g.instructorId === u.id)) ?? instructors[0])?.id || '';
  const [error, setError] = useState<string | null>(null);

  const tryMove = async (childId: string, groupId: string) => {
    if (groupId) {
      const size = data.groupMembers.filter((m) => m.groupId === groupId && m.childId !== childId).length;
      if (size >= MAX_GROUP) {
        setError(`That group already has ${MAX_GROUP} children. Groups are limited to ${MAX_GROUP}.`);
        return;
      }
    }
    setError(null);
    try {
      await moveChild(childId, groupId || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save.');
    }
  };

  return (
    <div data-testid="groups-tab">
      <p className="muted">{todayLabel()}. Groups have up to {MAX_GROUP} children.</p>
      {error && <div className="banner danger" data-testid="group-error">{error}</div>}
      <div className="grid2">
        {groups.map((g) => {
          const kids = data.groupMembers.filter((m) => m.groupId === g.id).map((m) => data.children.find((c) => c.id === m.childId)!).filter(Boolean);
          return (
            <section className="card" key={g.id} data-testid={`group-${g.id}`}>
              <div className="row between">
                <h3 style={{ margin: 0 }}>{g.name} · level {g.level}</h3>
                <span className={`chip ${kids.length >= MAX_GROUP ? 'warn' : ''}`} data-testid={`group-count-${g.id}`}>{kids.length}/{MAX_GROUP}</span>
              </div>
              <p className="small muted">{userName(data, g.instructorId)}</p>
              {kids.map((c) => (
                <div key={c.id} className="row between small" style={{ padding: '4px 0', borderTop: '1px solid var(--line)' }}>
                  <span>{fullName(c)} <span className="muted">L{c.level}</span></span>
                  <select style={{ width: 'auto', minHeight: 32, padding: '4px 6px' }} value={g.id} onChange={(e) => void tryMove(c.id, e.target.value)} aria-label={`Move ${fullName(c)}`} data-testid={`move-${c.id}`}>
                    {groups.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    <option value="">Remove from group</option>
                  </select>
                </div>
              ))}
            </section>
          );
        })}
      </div>
      <section className="card" data-testid="unplaced">
        <h3>Not in a group yet ({unplaced.length})</h3>
        {unplaced.length === 0 && <p className="muted small">Everyone is placed.</p>}
        {unplaced.map((c) => (
          <div key={c.id} className="row between small" style={{ padding: '4px 0' }}>
            <span>{fullName(c)} <span className="muted">L{c.level}</span></span>
            <select style={{ width: 'auto', minHeight: 32, padding: '4px 6px' }} value="" onChange={(e) => void tryMove(c.id, e.target.value)} aria-label={`Place ${fullName(c)}`} data-testid={`place-${c.id}`}>
              <option value="">Place in…</option>
              {groups.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        ))}
      </section>
      <form
        className="card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          if (groups.some((g) => g.instructorId === instructorId)) {
            setError(`${userName(data, instructorId)} already has a group today. An instructor teaches one group at a time.`);
            return;
          }
          setError(null);
          try {
            await addGroup(name.trim(), level, instructorId);
            setName('');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'That didn’t save.');
          }
        }}
        data-testid="new-group-form"
      >
        <h3>New group</h3>
        <div className="grid2">
          <div className="field"><label htmlFor="g-name">Name</label><input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Group D" data-testid="new-group-name" /></div>
          <div className="field">
            <label htmlFor="g-level">Level</label>
            <select id="g-level" value={level} onChange={(e) => setLevel(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6].map((l) => <option key={l}>{l}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="g-inst">Instructor</label>
            <select id="g-inst" value={instructorId} onChange={(e) => setInstructorId(e.target.value)} data-testid="new-group-instructor">{instructors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          </div>
        </div>
        <button className="primary" type="submit" data-testid="new-group-save">Create group</button>
      </form>
    </div>
  );
}

function ChildrenTab() {
  const { data } = useStore();
  const [editing, setEditing] = useState<Child | null>(null);
  const [missing, setMissing] = useState<Child | null>(null);
  return (
    <section className="card" data-testid="children-tab">
      <h2>All children ({data.children.length})</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Child</th><th>Age</th><th>Level</th><th>Day</th><th>Order</th><th>Today</th><th>Check-in details</th><th /></tr></thead>
          <tbody>
            {data.children.map((c) => {
              const a = todaysAttendance(data, c.id);
              const search = openSearchFor(data, c.id);
              return (
                <tr key={c.id} data-testid={`child-row-${c.id}`}>
                  <td><strong>{fullName(c)}</strong></td>
                  <td>{ageOn(c.birthDate, TODAY)}</td>
                  <td data-testid={`child-level-${c.id}`}>{c.level}</td>
                  <td>{c.programDay}</td>
                  <td className="small">{c.orderNumber}</td>
                  <td>{search ? <span className="chip danger">Missing</span> : a?.pickupAt ? 'Gone home' : a?.checkInAt ? 'Here' : '—'}</td>
                  <td className="small" data-testid={`child-checkin-${c.id}`}>
                    {a?.checkInAt ? (
                      <>
                        {timeLabel(a.checkInAt)} by {userName(data, a.checkedInBy)}
                        <br />
                        Jacket {a.jacket} · Pants {a.pants} · Helmet {a.helmet}
                        {a.clothingFixedAt && (
                          <>
                            <br />
                            <span className="muted">Corrected {timeLabel(a.clothingFixedAt)} by {userName(data, a.clothingFixedBy ?? null)}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="muted">Not checked in</span>
                    )}
                  </td>
                  <td className="row" style={{ gap: 6 }}>
                    <button type="button" onClick={() => setEditing(c)} data-testid={`edit-${c.id}`}>Edit</button>
                    {a?.checkInAt && !a.pickupAt && !search && (
                      <button type="button" className="ghost" style={{ color: 'var(--danger)' }} onClick={() => setMissing(c)}>Report missing</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && <EditChild child={editing} onClose={() => setEditing(null)} />}
      {missing && <ReportMissing child={missing} onClose={() => setMissing(null)} limitToSystemTime />}
    </section>
  );
}

function EditChild({ child, onClose }: { child: Child; onClose: () => void }) {
  const { updateChild } = useStore();
  const [firstName, setFirst] = useState(child.firstName);
  const [lastName, setLast] = useState(child.lastName);
  const [level, setLevel] = useState(child.level);
  const [programDay, setDay] = useState(child.programDay);
  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          updateChild(child.id, { firstName: firstName.trim(), lastName: lastName.trim(), level, programDay });
          onClose();
        }}
        data-testid="edit-child"
      >
        <h2>Edit {fullName(child)}</h2>
        <div className="grid2">
          <div className="field"><label htmlFor="e-first">First name</label><input id="e-first" value={firstName} onChange={(e) => setFirst(e.target.value)} /></div>
          <div className="field"><label htmlFor="e-last">Last name</label><input id="e-last" value={lastName} onChange={(e) => setLast(e.target.value)} /></div>
          <div className="field">
            <label htmlFor="e-level">Level</label>
            <select id="e-level" value={level} onChange={(e) => setLevel(Number(e.target.value))} data-testid="edit-level">{[1, 2, 3, 4, 5, 6].map((l) => <option key={l}>{l}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="e-day">Program day</label>
            <select id="e-day" value={programDay} onChange={(e) => setDay(e.target.value as Child['programDay'])}><option>Saturday</option><option>Sunday</option></select>
          </div>
        </div>
        <p className="small muted">Contacts, pickup adults and medical details are entered by parents. You can also edit them from the child’s record in the full build.</p>
        <div className="row"><button className="primary" type="submit" data-testid="edit-save">Save</button><button className="ghost" type="button" onClick={onClose}>Cancel</button></div>
      </form>
    </div>
  );
}

function AccessTab() {
  const { data } = useStore();
  return (
    <section className="card" data-testid="access-record">
      <h2>Who looked at sensitive information</h2>
      <p className="small muted">Every view of medical details and every look at a child during a search is recorded here.</p>
      {data.accessRecords.length === 0 ? (
        <p className="muted">Nothing recorded yet today.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Who</th><th>Role</th><th>Child</th><th>What</th></tr></thead>
            <tbody>
              {data.accessRecords.map((r) => {
                const c = data.children.find((x) => x.id === r.childId);
                return (
                  <tr key={r.id} data-testid="access-row">
                    <td>{timeLabel(r.at)}</td>
                    <td>{userName(data, r.userId)}</td>
                    <td>{ROLE_LABEL[r.role]}</td>
                    <td>{c ? fullName(c) : '—'}</td>
                    <td>{r.what}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const SAMPLE = `order_number,child_first,child_last,birth_date,level,program
KM-2025-118204,Owen,Okafor-Parr,2017-06-14,4,Saturday
KM-2026-121877,Hugo,Martin,2018-02-09,2,Sunday`;

function parseCsv(text: string): { rows: ImportRow[]; problems: string[] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const problems: string[] = [];
  const rows: ImportRow[] = [];
  lines.slice(1).forEach((line, i) => {
    const [orderNumber, firstName, lastName, birthDate, level, program] = line.split(',').map((s) => s.trim());
    const lvl = Number(level);
    if (!orderNumber || !firstName || !lastName || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate ?? '') || !(lvl >= 1 && lvl <= 6) || !['Saturday', 'Sunday'].includes(program)) {
      problems.push(`Row ${i + 2} skipped: check the order number, name, birth date (YYYY-MM-DD), level (1-6) and program (Saturday or Sunday).`);
      return;
    }
    rows.push({ orderNumber, firstName, lastName, birthDate, level: lvl, programDay: program as ImportRow['programDay'] });
  });
  return { rows, problems };
}

function UploadTab() {
  const { importRows } = useStore();
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  return (
    <section className="card" data-testid="upload-tab">
      <h2>Import from the online store</h2>
      <p className="small muted">
        Upload the nightly registration export. Children are matched on the store order number: existing children are updated, new ones are added. Payment details are never imported.
      </p>
      <div className="field">
        <label htmlFor="csv-file">Spreadsheet file (.csv)</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setText(await f.text());
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="csv-text">Or paste it here</label>
        <textarea id="csv-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.85rem' }} data-testid="upload-text" />
      </div>
      <button
        className="primary"
        type="button"
        onClick={() => {
          const { rows, problems } = parseCsv(text);
          setProblems(problems);
          const r = importRows(rows);
          setResult(`${r.added} new ${r.added === 1 ? 'child' : 'children'} added, ${r.updated} updated.`);
        }}
        data-testid="upload-import"
      >
        Import
      </button>
      {result && <div className="banner ok" style={{ marginTop: 12 }} data-testid="upload-result">{result}</div>}
      {problems.map((p) => <p key={p} className="field-error">{p}</p>)}
    </section>
  );
}
