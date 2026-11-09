# Piezas quality scan packet

Scan code: qs-191ff55cd5318978af
Round: 3 of 3
Project folder: C:\Users\mchan\Desktop\School\Fall 2026\sfu_venture_labs_2026

## The app description (what the owner approved)

# Product Spec — Kestrel Kids Portal

<!--
Sources referenced below:
  case      = "Pending Chaos at Kestrel Kids" (case PDF)
  table     = permissions_table.xlsx (team's role x record access table)
  team      = decisions made with Michelle in planning chats (Nov 2026)
-->

## Overview

Kestrel Kids is a ski school at Kestrel Mountain with about 220 children (ages 5 to 12) on a busy Saturday, 72 instructors, a check-in/pickup desk and an 18-person ski patrol (case, Exhibit 1). Today a child's information is spread across the online store, a paper consent form, a binder, a taped alert list and sticky notes, and it fails at the moments that matter: an allergy missed, a lost child whose contacts couldn't be found, and an uncle nearly given the wrong child (case, section 4).

The portal gives each person one screen with exactly what their job needs, at the moment they need it, and nothing else. There are five roles: parent, instructor, desk (receptionist), patrol and administrator. Parents enter information once, and it follows the child through the day. The online store stays the place where families pay; the portal never holds payment details (case, section 5).

## Requirements

### Accounts and sign-in
- R-001: Every person signs in and sees only the screens for their role: parent, instructor, desk, patrol or administrator. (table, "role_id in User" column)
- R-002: A parent gets a welcome email with a link to set up their account. After that, they sign in with email and password, followed by a 6-digit code emailed to them each time. (team asked for "magic link + confirmation code"; Piezas offers email + password with an emailed code, so this is the closest supported version)
- R-003: Only the administrator can create staff accounts and give them a role. (table, administrator is "editor" on role_id)

### Parents
- R-004: A parent sees only their own children and never another family's. (table, parent "view own"/"edit own")
- R-005: A parent can add, change or remove the adults linked to their child, with any last name: emergency contacts (as many as they want, in calling order: 1st, 2nd, 3rd, 4th and so on; team, Nov 8) and adults allowed to pick up. (case, Owen's father under a different last name; Lily's uncle)
- R-006: A parent can enter and update their child's medical alerts: a short alert, details, where medication is kept, and severity. (table, parent "edit own" on Child_Medical; case, Ava's allergy)
- R-007: A change a parent saves shows on the desk, instructor and patrol screens right away, with no email inbox in between. (case, 23 of 96 emailed updates never reached the binder)
- R-008: A parent completes the consent form inside the portal, including photo consent, instead of on paper. (case, 41 children with no consent form on day one)
- R-009: Phone numbers are checked when entered, and an incomplete number is refused. (case, Exhibit 4B, "604555-187")
- R-010: A parent can see their child's group, lesson days and attendance (check-in and pickup times, and who picked them up). (table, parent "view own" on Lesson and Attendance_Log)

### Instructors
- R-011: An instructor sees the children in their own group for today, and no other children. (table, instructor "view own group")
- R-012: Each child on the instructor's list shows a short alert that is useful with no taps, such as "Tree nut allergy, EpiPen in backpack". (table, "alert summary only for own group"; team)
- R-013: An instructor can tap an alert to see the full medical details, and every such view is recorded. (table, "detail on click"; team; case, section 6 privacy rules)
- R-014: The instructor screens work on a phone with large buttons usable in gloves. (case, section 5)
- R-034: An instructor can correct the jacket, pants and helmet colour for a child in their own group, if the child changes or the check-in entry was wrong. The change records who made it and when, and reaches patrol straight away if a search is open. (team, Nov 8; changes instructor access to Attendance_Log from "view own group")
- R-032: An instructor can save today's group to their phone and still see it with no connection: names, bibs, today's clothing, the short alerts and where medication is kept. Full medical details, contacts and other groups are not saved. The saved copy deletes itself at 4 p.m. and can be deleted sooner. (team, Nov 7; case, section 5, "dying phone", no wifi on the hill)

### Desk (receptionist)
- R-015: The desk can find any child by name or bib number and check them in, recording time, staff member, and today's jacket, pants and helmet colour, by tapping a colour or typing one. (case, check-in of 220 children in 45 minutes; Owen's jacket colour was wrong)
- R-016: At pickup, the desk sees the child's approved pickup adults and records who took the child home and who released them. (case, "nobody wrote down who took each child home")
- R-017: If the adult is not on the approved list, the desk is warned, the child is not released, and the refused attempt is recorded. (case, Lily's uncle)
- R-018: The desk never sees medical details. (table, receptionist "none" on Child_Medical; case, alert list readable from the pickup line)

### Missing child
- R-019: An instructor, the desk or the administrator can report a child missing in one step, entering where and when the child was last seen. (table, Patrol_Emergency "create"; case, Owen's radio call came 10 minutes late)
- R-020: When a child is reported missing, every patroller is alerted immediately. (case, Rob: "all the information in one screen or one call")
- R-021: While a search is open, patrol sees one screen for that child: photo if consented, today's jacket, pants and helmet colour, medical alerts, all emergency contacts in calling order, approved adults, group, instructor, and last seen place and time. (table, patrol "view if open emergency")
- R-022: Patrol can see a child's details only while a search is open. When it is closed, the access ends. (table; case, section 6 privacy rules)
- R-023: A patroller acknowledges the alert, and everyone on the search sees who has acknowledged. (table, Patrol_Emergency "acknowledge")
- R-024: The search screen counts down to the time police must be called: 60 minutes after the last seen time, or 4 p.m., whichever comes first. (case, section 6)
- R-025: Patrol can record when the child's details were shared with police. The search then shows a reminder that a notice must be mailed to the family. (case, section 6 privacy rules; team)
- R-026: A search is closed with an outcome and a closing time. (team)

### Administrator
- R-027: The administrator sees which children are missing information: no consent form, no second emergency contact, no pickup adult, or no medical answer. (case, Hana's need; team)
- R-028: The administrator manages lesson days and groups (level, instructor, up to 6 children), and can move children between groups. (case, section 2; table, administrator "editor" on Group_Members)
- R-029: The administrator can edit any child's record. (table, administrator "edit")
- R-033: The administrator sees each child's check-in details for today: time, staff member, and jacket, pants and helmet colour. (team, Nov 7; table, administrator "view" on Attendance_Log)
- R-030: The administrator can see the record of who viewed medical details and who accessed a child during a search. (team; case, section 6)
- R-031: The administrator can upload the store's registration spreadsheet. New children are added and existing ones updated, matched on order number. (case, Corinne's nightly export)

## Data

- Child: first name, last name, birth date, ability level 1 to 6, program day (Saturday or Sunday), store order number, photo (only with photo consent)
- Person: name, phone, email (any adult linked to a child, with or without a sign-in)
- Child_Person: child, person, relationship, emergency contact order (1st, 2nd, 3rd and so on, or none), allowed to pick up (yes or no)
- Parent_Account: parent sign-in, child (which children a parent may see and edit)
- Medical_Alert: child, short alert, details, medication location, severity
- Consent_Form: child, signed by, signed date, photo consent
- Lesson_Day: date, program day
- Group: lesson day, level, instructor
- Group_Member: group, child
- Attendance: child, lesson day, check-in time, checked in by, jacket colour, pants colour, helmet colour, pickup time, picked up by (person), released by, clothing corrected by, clothing corrected at
- Pickup_Refusal: child, lesson day, name given by the adult, time, staff member
- Emergency: child, reported by, last seen place, last seen time, jacket colour, pants colour, helmet colour, status (open or closed), shared with police at, police notice mailed (yes or no), closed at, outcome
- Patrol_Acknowledgement: emergency, patroller, acknowledged at
- Access_Record: who, role, what was viewed, child, time
- Staff and parent sign-ins and roles are kept by Piezas sign-in, never as records here.

## Acceptance Scenarios

### S-001: Each person only sees their own role's screens

covers: R-001, R-003
Given an instructor account created by the administrator
When the instructor signs in and tries to open the desk check-in screen
Then they are shown their own group screen instead, and the desk screen is not available to them

### S-002: A parent sets up their account from the welcome email

covers: R-002
needs: a real email inbox for a test parent
Given a parent whose child was added from the store spreadsheet
When they open the welcome email link, set a password, sign in, and enter the emailed 6-digit code
Then they arrive at their child's page

### S-003: A parent only sees their own children

covers: R-004
Given two families each with one child
When the first parent signs in
Then only their own child is listed, and opening the other child's page shows "not found"

### S-004: A grandparent with a different last name can pick up

covers: R-005, R-007, R-016
Given Owen Okafor-Parr, whose mother is his only approved adult
When his mother adds "Grace Okafor (grandmother)" as allowed to pick up
Then the desk pickup screen for Owen immediately shows Grace as approved, and the desk can release Owen to her and record it

### S-005: A parent's allergy reaches the instructor

covers: R-006, R-007, R-012
Given Ava is in Sam's group today
When Ava's parent adds the alert "Tree nut allergy, EpiPen in backpack"
Then Sam's group list shows that alert next to Ava without any taps

### S-006: A parent signs the consent form in the portal

covers: R-008
Given a child with no consent form
When the parent completes and signs the consent form, choosing no photo consent
Then the child no longer appears as "no consent form" for the administrator, and no photo is shown for the child anywhere

### S-007: An incomplete phone number is refused

covers: R-009
Given a parent adding an emergency contact
When they enter the phone number "604555-187"
Then the form says the number is incomplete and does not save

### S-008: A parent sees who picked up their child

covers: R-010
Given Lily was checked in and picked up by her mother today
When Lily's parent opens her page
Then they see her group, today's check-in time, pickup time, and "picked up by" her mother

### S-009: An instructor only sees their own group

covers: R-011, R-014
Given Sam teaches a level 3 group of five children today
When Sam signs in on a phone
Then exactly those five children are listed in large rows, and children from other groups cannot be opened

### S-010: Opening medical details is recorded

covers: R-013, R-030
Given Sam's group list shows Ava's allergy alert
When Sam taps the alert
Then the full medical details appear, and the administrator's access record shows Sam viewed Ava's medical details at that time

### S-011: Desk checks in a child with today's clothing

covers: R-015
Given Owen is registered for today and not yet checked in
When the desk searches "Owen", checks him in, and enters jacket "red", pants "black" and helmet "white"
Then Owen shows as checked in, with the time, the staff member's name, and his clothing colours

### S-012: An unapproved adult is stopped at pickup

covers: R-017
Given Lily's approved adults are her mother and father only
When a man saying he is her uncle asks to pick her up
Then the desk sees a warning that he is not approved, Lily stays checked in, and the refused attempt is recorded with the time and staff member

### S-013: The desk cannot see medical details

covers: R-018
Given Ava has a tree nut allergy on file
When the desk opens Ava's pickup screen
Then no medical alert or medical detail is shown

### S-014: Reporting a missing child alerts patrol in one step

covers: R-019, R-020
Given Owen is checked in and in Sam's group
When Sam reports Owen missing, last seen at the top of the Pigeon chair at 1:40 p.m.
Then every patroller sees a new search alert for Owen right away

### S-015: Patrol sees everything on one screen during a search

covers: R-021, R-023
Given an open search for Owen
When a patroller opens the search and acknowledges it
Then one screen shows Owen's jacket, pants and helmet colour, medical alerts, all emergency contacts with phone numbers, approved adults, group, instructor, and last seen place and time, and the patroller is listed as acknowledged

### S-016: Patrol access ends when the search closes

covers: R-022, R-026
Given an open search for Owen that patrol can see
When the search is closed as "found safe"
Then the closing time and outcome are saved, and patrol can no longer open Owen's details

### S-017: The search shows when police must be called

covers: R-024
Given Owen was last seen at 1:40 p.m.
When patrol opens the search at 2:00 p.m.
Then the screen shows 40 minutes left before police must be called at 2:40 p.m.

### S-018: Sharing with police leaves a reminder to notify the family

covers: R-025
Given an open search for Owen
When patrol records that Owen's details were shared with police
Then the time is saved, and the search shows "Mail a notice to the family" until it is marked done

### S-019: The administrator sees whose information is missing

covers: R-027
Given one child with no consent form and another with only one emergency contact
When the administrator opens the missing information list
Then both children are listed with what each is missing

### S-020: The administrator builds groups for a lesson day

covers: R-028
Given a lesson day with no groups
When the administrator creates a level 3 group with Sam as instructor and adds six children
Then the group shows six children, and adding a seventh is refused

### S-021: The administrator corrects a child's record

covers: R-029
Given Owen's level is 3
When the administrator changes it to 4
Then Owen shows as level 4 everywhere

### S-022: The store spreadsheet adds and updates children

covers: R-031
Given Owen is already in the portal with order number KM-2025-118204
When the administrator uploads a spreadsheet with Owen's row (level changed to 4) and one new child
Then Owen is updated rather than duplicated, and the new child is added

### S-023: An instructor's group still shows with no wifi

covers: R-032
Given Sam has saved today's group to his phone, including Ava's alert "Tree nut allergy, EpiPen in backpack"
When his phone loses its connection and he opens his group
Then he sees his five children with bibs, clothing and Ava's alert, and no full medical details or contacts

### S-024: The administrator sees today's check-in clothing

covers: R-033
Given the desk checked Owen in wearing a red jacket, black pants and a white helmet
When the administrator opens the list of children
Then Owen's row shows his check-in time, who checked him in, and "red" jacket, "black" pants and "white" helmet

### S-025: A parent can list as many emergency contacts as they need

covers: R-005
Given Owen already has a 1st and a 2nd emergency contact
When his mother adds Grace Okafor and chooses "3rd emergency contact", then adds another adult and chooses "4th emergency contact"
Then Owen shows four emergency contacts in that order, and patrol's search screen lists all four

### S-026: The desk can tap a colour or type one

covers: R-015
Given Owen is not yet checked in
When the desk taps "Red" for jacket and "Black" for pants, and types "camo" for helmet, then checks him in
Then Owen shows as checked in with a Red jacket, Black pants and a camo helmet

### S-027: An instructor corrects a child's clothing

covers: R-034
Given Ava is in Sam's group, checked in with a Purple jacket, and a search for her is open
When Sam changes her jacket to Green and saves
Then Sam's list shows a Green jacket with his name and the time of the correction, patrol's search screen shows Green, and Sam has no way to correct a child in another group

## Open Conflicts

none

## Piezas rules

- Hard No: no secret key (PIEZAS_API_KEY or any provider secret) in browser code or behind NEXT_PUBLIC_/VITE_/PUBLIC_; no local database for business records (no SQLite, Prisma, Postgres client, JSON files as a database); no homemade copy of the Piezas SDK.
- Data isolation: every list, record read and change is limited to what the signed-in person may see. One user, customer, tenant or role must never see or change another's data.
- Sign-in: every page and server route with business data needs a signed-in person (and the right role); nothing private is reachable signed out.
- Provider tokens never live in the app: it stores connection and grant ids only.

### Core Rules

- **You advise; the owner decides.** Explain risks simply, recommend;
  never refuse the owner's choice or leave them at a dead end. Only the
  owner's own reply ("deploy anyway", "allow outside changes"; for the
  quality scan, "accept N", "go live without the scan" or "quality scan
  off") overrides a Piezas pause, never yours.
- **Plain words for the owner.** Brief and actionable: what happened, then
  the choice with the exact reply. No jargon, no long lists. (`testing`)
- **The AI fixes first; the owner is asked once**, for what only they can
  answer: one pause, remembered per item. (`testing`)
- **Ownership boundary.** The app owns UI, routes, session glue and workflow.
  Piezas owns records, pipelines, tasks, calendars, notifications, documents,
  integrations and end-user accounts. (`entities`)
- **Secrets stay server-side.** `PIEZAS_API_KEY` never behind
  `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_`; `.env` in `.gitignore`; other settings
  in `deploy.requiredEnv`/`optionalEnv`. (`deploy`)
- **No provider tokens in the app.** Store connection and grant IDs only.
  Integrations never sign people in: Google/Microsoft sign-in is
  `@piezas/sdk/sso`. (`users`)
- **Credentials live in the users service**, never in records. (`users`)
- **Per-member isolation is YOUR job.** Derive `owner_id` from the verified
  session; filter every read by it. (`users`)
- **Spec first, mock first.** `SPEC.md` with an `S-xxx` scenario per
  requirement; then UI plus seed data, before any backend wiring. (`testing`)
- **Tested before shared.** Every `S-xxx` is a Playwright test
  (`tests/scenarios/S-xxx-<name>.spec.ts`, by `data-testid`). Run `piezas
  test`, fix, re-run (3 rounds) without asking; never weaken a check without
  the owner's OK. (`testing`)
- **Fetch the slice before using a service** (and before deploying):
  `piezas_contract` with its `topic`.
- **Rule 11 — If Piezas doesn't offer it, say so.** Check
  `piezas_capabilities` (.piezas/rules/capabilities.json) before promising.
  If it's missing, say so with the workable options, recommend one, then
  follow the owner's choice. Don't change Piezas's code (backend, SDK, CLI,
  MCP) or invent endpoints unless the owner explicitly asks, knowing the risk.
- **Change only the app's folder.** Use the published `@piezas/sdk`; no
  homemade copy, and no Piezas address outside this contract. Once they know
  the risk, only the owner may type "allow outside changes".

### Hard No List

Never do these on your own. If the owner asks, explain the risk and recommend
the Piezas way; a deploy that breaks one pauses until the owner fixes it or
says "deploy anyway".

- No local database tables for Piezas-backed business objects.
- No OAuth token storage, token refresh jobs, or integration OAuth callbacks in the app.
- No scraping or undocumented provider API calls when a Piezas connector exists.
- No exposing `PIEZAS_API_KEY` to browser code.
- No public MCP route without app auth, tenant checks, and server runtime.
- No hand-written OAuth/OIDC sign-in (use `@piezas/sdk/sso`).

## The last test run

No test run is recorded yet (`piezas test` has not run).

## Problems from the previous scan: check each one again

1. [high] Anyone can get into any role: the sign-in accepts any password with a code printed on the page, and buttons on the first screen open a parent, instructor, patrol or administrator account with no sign-in at all. (app/page.tsx)
2. [high] When someone reports a child missing, only that one browser window knows about it, so no patroller is alerted even though the reporter is told "Ski patrol has been alerted." (lib/store.tsx)
3. [high] A parent's new allergy, a signed consent form, a check-in, a clothing change, a pickup, or the administrator's groups and spreadsheet upload never reach anyone else's screen and are lost on reload, so staff can act on old information. (lib/store.tsx)
4. [high] Every family's medical details and contacts are sent to the browser of every signed-in person, and only the screen layout hides them, so a parent, the desk or patrol with no open search could still get at them. (lib/store.tsx)
5. [high] Patrol is still given every family's contacts and pickup adults at all times, even when no search is open, instead of only during a search. (app/api/guardians/route.ts)
6. [high] On the live site parents cannot save or see saved contacts and pickup adults at all, because that saving only works on the builder's own computer until real sign-in exists. (app/api/guardians/route.ts)
7. [high] Parents have no way to get an account: there is no welcome email or set-password page, and the store spreadsheet does not link a new child to any parent. (app/admin/page.tsx)
8. [high] The administrator cannot create staff accounts or give anyone a role, so no real instructor, desk or patrol person can be added. (app/admin/page.tsx)
9. [high] An instructor who opens the app on the hill with no wifi gets nothing, because the saved group only shows if the page was already open and signed in when the connection dropped. (components/OfflineCopy.tsx)
10. [high] The app runs on a made-up clock that always says Saturday, December 12 and restarts at 1:35 p.m., so the police countdown, consent signing dates and the 4 p.m. delete would be wrong on a real day. (lib/store.tsx)
11. [high] The administrator can only change a child's name, level and day, and cannot edit the child's contacts, pickup adults, medical alerts or consent form. (app/admin/page.tsx)
12. [high] The administrator cannot manage lesson days or build groups for any day other than the one Saturday, and Sunday children cannot be found at the desk or placed in a group. (app/admin/page.tsx)
13. [high] The record of who viewed medical details or opened a child during a search stays only in that person's own browser window, so the administrator never sees it and it disappears on reload. (lib/store.tsx)
14. [medium] None of the 27 agreed checks has been written and no test run exists, so nothing the owner approved has been proven to work, and the test copy has no sample families to check against. (tests/scenarios)
15. [medium] If saved contacts and pickup adults cannot be loaded, the desk and patrol get no warning and keep seeing an old list, so a child could be released to someone a parent already removed. (lib/store.tsx)
16. [medium] If one parent removes a pickup adult and the other parent saves a change a few seconds later, the removed adult comes back as approved for pickup. (lib/server/guardians.ts)
17. [medium] No child photo can be added anywhere, so patrol never sees a real photo during a search even when the parent gave photo consent, only the child's initials. (app/patrol/page.tsx)

## The change

Changed since the last scan (2026-11-09T00:35:37.176Z): 3 file(s) added or changed, 0 removed.

### changed: app/desk/page.tsx

````
'use client';

import { useState } from 'react';
import { ColourPicker } from '@/components/ColourPicker';
import { ReportMissing } from '@/components/ReportMissing';
import { Shell } from '@/components/Shell';
import { adultsFor, fullName, groupOfChild, openSearchFor, timeLabel, todaysAttendance, userName } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function DeskHome() {
  return (
    <Shell role="desk">
      <Desk />
    </Shell>
  );
}

function Desk() {
  const { data } = useStore();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Today's children are everyone registered for Saturday.
  const kids = data.children.filter((c) => c.programDay === 'Saturday');
  const att = (id: string) => todaysAttendance(data, id);
  const checkedIn = kids.filter((c) => att(c.id)?.checkInAt).length;
  const pickedUp = kids.filter((c) => att(c.id)?.pickupAt).length;

  const term = q.trim().toLowerCase();
  const results = term
    ? kids.filter((c) => fullName(c).toLowerCase().includes(term) || String(c.bib) === term)
    : kids;
  const selected = data.children.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <div className="row between" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Check-in and pickup</h1>
        <div className="row small" data-testid="desk-counts">
          <span className="chip ok">{checkedIn} of {kids.length} checked in</span>
          <span className="chip">{pickedUp} gone home</span>
        </div>
      </div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <section className="card">
          <label htmlFor="desk-search">Find a child by name or bib number</label>
          <input id="desk-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Owen, or 101" autoFocus data-testid="desk-search" />
          <div style={{ marginTop: 12, maxHeight: 480, overflowY: 'auto' }} data-testid="desk-results">
            {results.map((c) => {
              const a = att(c.id);
              const status = openSearchFor(data, c.id) ? (
                <span className="chip danger">Missing</span>
              ) : a?.pickupAt ? (
                <span className="chip">Gone home</span>
              ) : a?.checkInAt ? (
                <span className="chip ok">Here</span>
              ) : (
                <span className="chip warn">Not checked in</span>
              );
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  style={{ width: '100%', justifyContent: 'space-between', marginBottom: 6, borderColor: c.id === selectedId ? 'var(--brand)' : undefined }}
                  data-testid={`desk-result-${c.id}`}
                >
                  <span>
                    <strong>{fullName(c)}</strong> <span className="muted small">· bib {c.bib}</span>
                  </span>
                  {status}
                </button>
              );
            })}
            {results.length === 0 && <p className="muted">No child matches “{q}”.</p>}
          </div>
        </section>
        <section>{selected ? <ChildPanel key={selected.id} child={selected} /> : <div className="card muted">Pick a child to check in or release.</div>}</section>
      </div>
      {data.refusals.length > 0 && (
        <section className="card" data-testid="refusals">
          <h2>Pickups refused today</h2>
          <table>
            <thead>
              <tr><th>Time</th><th>Child</th><th>Adult who asked</th><th>Staff</th></tr>
            </thead>
            <tbody>
              {data.refusals.map((r) => {
                const c = data.children.find((x) => x.id === r.childId)!;
                return (
                  <tr key={r.id}><td>{timeLabel(r.at)}</td><td>{fullName(c)}</td><td>{r.nameGiven}</td><td>{userName(data, r.staffId)}</td></tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function ChildPanel({ child }: { child: Child }) {
  const { data, checkIn, release, refusePickup, guardianLink } = useStore();
  const a = todaysAttendance(data, child.id);
  const group = groupOfChild(data, child.id);
  const adults = adultsFor(data, child.id);
  const [jacket, setJacket] = useState(a?.jacket ?? '');
  const [pants, setPants] = useState(a?.pants ?? '');
  const [helmet, setHelmet] = useState(a?.helmet ?? '');
  const clothingDone = Boolean(jacket.trim() && pants.trim() && helmet.trim());
  const [otherName, setOtherName] = useState('');
  const [askOther, setAskOther] = useState(false);
  const [refused, setRefused] = useState<string | null>(null);
  const [onList, setOnList] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const search = openSearchFor(data, child.id);

  return (
    <div className="card" data-testid="desk-child-panel">
      <h2>{fullName(child)}</h2>
      <p className="muted small">Bib {child.bib} · Level {child.level} · {group ? `${group.name}, ${userName(data, group.instructorId)}` : 'No group yet'}</p>

      {search && <div className="banner danger">Ski patrol is searching for {child.firstName}.</div>}

      {!a?.checkInAt && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clothingDone) return;
            checkIn(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() });
          }}
          data-testid="checkin-form"
        >
          <h3>Check in</h3>
          <p className="small muted">Note today’s clothing: patrol uses it if {child.firstName} goes missing.</p>
          <ColourPicker id="jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="checkin-jacket" />
          <ColourPicker id="pants" label="Pants colour" value={pants} onChange={setPants} testId="checkin-pants" />
          <ColourPicker id="helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="checkin-helmet" />
          <button className="primary big" type="submit" disabled={!clothingDone} data-testid="checkin-submit">Check in {child.firstName}</button>
        </form>
      )}

      {a?.checkInAt && (
        <div className="banner ok" data-testid="checkin-status">
          Checked in at {timeLabel(a.checkInAt)} by {userName(data, a.checkedInBy)} · {a.jacket} jacket, {a.pants} pants, {a.helmet} helmet
          {a.clothingFixedAt && <div className="small" data-testid="clothing-fixed-note">Clothing corrected at {timeLabel(a.clothingFixedAt)} by {userName(data, a.clothingFixedBy ?? null)}</div>}
        </div>
      )}

      {a?.pickupAt && (
        <div className="banner ok" data-testid="pickup-status">
          Went home at {timeLabel(a.pickupAt)} with {data.persons.find((p) => p.id === a.pickedUpBy)?.name}, released by {userName(data, a.releasedBy)}
        </div>
      )}

      {a?.checkInAt && !a.pickupAt && !search && (
        <div data-testid="pickup-panel">
          {guardianLink === 'offline' && (
            <div className="banner danger" data-testid="guardians-stale">
              Can’t reach Peak Pals, so this list may be out of date. Call a parent to confirm before releasing {child.firstName}.
            </div>
          )}
          <h3>Pickup: approved adults</h3>
          <p className="small muted">Ask for photo ID if you don’t recognize the adult.</p>
          {refused && (
            <div className="banner danger" data-testid="pickup-refused">
              {refused} is NOT on {child.firstName}’s pickup list. Do not release {child.firstName}. The attempt has been recorded. Call a parent below.
            </div>
          )}
          {onList && (
            <div className="banner ok" data-testid="pickup-on-list">
              {onList} is on {child.firstName}’s pickup list. Check their photo ID, then use their Release button.
            </div>
          )}
          <div className="stack">
            {adults.filter((x) => x.link.canPickUp).map(({ person, link }) => (
              <button key={link.id} type="button" className="big" style={{ justifyContent: 'space-between' }} onClick={() => release(child.id, person.id)} data-testid={`release-to-${person.name}`}>
                <span>Release to <strong>{person.name}</strong> <span className="muted small">({link.relationship})</span></span>
                <span className="small muted">{person.phone}</span>
              </button>
            ))}
          </div>
          {!askOther ? (
            <button type="button" className="ghost" style={{ marginTop: 10 }} onClick={() => setAskOther(true)} data-testid="someone-else">Someone else is here</button>
          ) : (
            <form
              style={{ marginTop: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!otherName.trim()) return;
                // Only a name that isn't on the approved list counts as a refusal.
                const tidy = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
                const approved = adults.find((x) => x.link.canPickUp && tidy(x.person.name) === tidy(otherName));
                if (approved) {
                  setOnList(approved.person.name);
                  setRefused(null);
                } else {
                  refusePickup(child.id, otherName.trim());
                  setRefused(otherName.trim());
                  setOnList(null);
                }
                setOtherName('');
                setAskOther(false);
              }}
            >
              <label htmlFor="other">Name the adult gave</label>
              <div className="row">
                <input id="other" style={{ flex: 1 }} value={otherName} onChange={(e) => setOtherName(e.target.value)} data-testid="other-name" />
                <button type="submit" data-testid="other-check">Check</button>
              </div>
            </form>
          )}
          <h3 style={{ marginTop: 16 }}>Parents to call</h3>
          <ul className="small" data-testid="desk-contacts">
            {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
              <li key={link.id}>{person.name} ({link.relationship}): {person.phone}</li>
            ))}
          </ul>
          <button type="button" className="ghost" style={{ color: 'var(--danger)' }} onClick={() => setMissing(true)} data-testid="desk-report-missing">Report missing</button>
        </div>
      )}
      {missing && <ReportMissing child={child} onClose={() => setMissing(false)} />}
    </div>
  );
}
````

### changed: app/patrol/page.tsx

````
'use client';

import { useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { adultsFor, ageOn, fullName, groupOfChild, policeDeadline, timeLabel, userName } from '@/lib/access';
import { TODAY, type Emergency } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function PatrolHome() {
  return (
    <Shell role="patrol">
      <Patrol />
    </Shell>
  );
}

function Patrol() {
  const { data, markNoticeMailed } = useStore();
  const open = data.emergencies.filter((e) => e.status === 'open');
  const closed = data.emergencies.filter((e) => e.status === 'closed');
  const [openId, setOpenId] = useState<string | null>(null);
  const current = open.find((e) => e.id === openId) ?? (open.length === 1 ? open[0] : null);

  return (
    <>
      {open.length === 0 ? (
        <div className="card" data-testid="no-searches">
          <h1>No open searches</h1>
          <p className="muted">When an instructor or the desk reports a child missing, the alert appears here immediately. Children’s details are only available to patrol during a search.</p>
        </div>
      ) : (
        <>
          {open.length > 1 && (
            <div className="row" style={{ marginBottom: 12 }}>
              {open.map((e) => {
                const c = data.children.find((x) => x.id === e.childId)!;
                return (
                  <button key={e.id} type="button" className={current?.id === e.id ? 'primary' : ''} onClick={() => setOpenId(e.id)}>
                    {fullName(c)}
                  </button>
                );
              })}
            </div>
          )}
          {current && <SearchScreen key={current.id} em={current} />}
        </>
      )}
      {closed.length > 0 && (
        <section className="card" data-testid="closed-searches">
          <h2>Closed searches today</h2>
          <p className="small muted">Children’s details are no longer available once a search is closed.</p>
          <table>
            <thead><tr><th>Child</th><th>Closed</th><th>Outcome</th><th>Notice to family</th></tr></thead>
            <tbody>
              {closed.map((e) => {
                const c = data.children.find((x) => x.id === e.childId)!;
                return (
                  <tr key={e.id}>
                    <td>{c.firstName} {c.lastName.charAt(0)}.</td>
                    <td>{timeLabel(e.closedAt)}</td>
                    <td>{e.outcome}</td>
                    <td>
                      {!e.sharedWithPoliceAt ? (
                        'Not needed'
                      ) : e.noticeMailed ? (
                        'Mailed'
                      ) : (
                        <button type="button" onClick={() => markNoticeMailed(e.id)}>To mail · mark done</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function SearchScreen({ em }: { em: Emergency }) {
  const { data, me, now, acknowledge, shareWithPolice, markNoticeMailed, closeSearch, logAccess, guardianLink } = useStore();
  const child = data.children.find((c) => c.id === em.childId)!;
  const group = groupOfChild(data, child.id);
  const adults = adultsFor(data, child.id);
  const alerts = data.medical.filter((m) => m.childId === child.id);
  const consent = data.consents.find((c) => c.childId === child.id);
  const acks = data.acks.filter((a) => a.emergencyId === em.id);
  const iAcked = acks.some((a) => a.patrollerId === me!.id);
  const [closing, setClosing] = useState(false);
  const [outcome, setOutcome] = useState('Found safe');

  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logAccess('Opened child details during a search', child.id);
  }, [logAccess, child.id]);

  const deadline = policeDeadline(em.lastSeenAt);
  const msLeft = deadline.getTime() - now.getTime();
  const minsLeft = Math.ceil(msLeft / 60_000);
  const minsMissing = Math.max(0, Math.floor((now.getTime() - new Date(em.lastSeenAt).getTime()) / 60_000));

  return (
    <div data-testid="search-screen">
      <div className="banner danger" style={{ fontSize: '1.1rem' }}>
        MISSING CHILD: {fullName(child)}, age {ageOn(child.birthDate, TODAY)} · missing {minsMissing} min
      </div>

      <div className="grid2" style={{ alignItems: 'start' }}>
        <section className="card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div
              aria-label={consent?.photoConsent ? 'Photo' : 'No photo consent'}
              style={{ width: 84, height: 100, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: consent?.photoConsent ? '1.8rem' : '0.75rem', color: 'var(--ink-2)', textAlign: 'center', padding: 4 }}
              data-testid="search-photo"
            >
              {consent?.photoConsent ? `${child.firstName[0]}${child.lastName[0]}` : 'No photo consent'}
            </div>
            <dl className="kv" style={{ flex: 1 }}>
              <dt>Jacket</dt><dd data-testid="search-jacket">{em.jacket}</dd>
              <dt>Pants</dt><dd data-testid="search-pants">{em.pants}</dd>
              <dt>Helmet</dt><dd data-testid="search-helmet">{em.helmet}</dd>
              <dt>Level</dt><dd>{child.level}</dd>
              <dt>Bib</dt><dd>{child.bib}</dd>
            </dl>
          </div>
          <h3 style={{ marginTop: 14 }}>Last seen</h3>
          <p data-testid="search-last-seen"><strong>{em.lastSeenPlace}</strong> at {timeLabel(em.lastSeenAt)}</p>
          <p className="small muted">Reported by {userName(data, em.reportedBy)}</p>
          <h3>Group</h3>
          <p data-testid="search-group">{group ? `${group.name} · instructor ${userName(data, group.instructorId)}` : 'No group'}</p>
        </section>

        <section className="card" data-testid="search-countdown">
          <h3>Call police by {deadline.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}</h3>
          <div className="big-number" style={{ color: minsLeft <= 10 ? 'var(--danger)' : undefined }}>
            {msLeft > 0 ? `${minsLeft} min left` : 'Call police now'}
          </div>
          <p className="small muted">60 minutes after last seen, or 4 p.m., whichever comes first. Call the family at the same time.</p>
          {!em.sharedWithPoliceAt ? (
            <button type="button" onClick={() => shareWithPolice(em.id)} data-testid="share-police">Record: details shared with police</button>
          ) : (
            <div className="stack">
              <div className="banner warn" data-testid="police-shared">Shared with police at {timeLabel(em.sharedWithPoliceAt)}</div>
              {!em.noticeMailed ? (
                <div className="row between card" style={{ margin: 0 }} data-testid="notice-todo">
                  <span>Mail a notice to the family (privacy law)</span>
                  <button type="button" onClick={() => markNoticeMailed(em.id)}>Mark done</button>
                </div>
              ) : (
                <span className="chip ok">Notice mailed</span>
              )}
            </div>
          )}
        </section>

        <section className="card" data-testid="search-medical">
          <h3>Medical</h3>
          {alerts.length === 0 ? <p className="muted">No medical alerts.</p> : alerts.map((a) => (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div className={`alert-line ${a.severity}`}>{a.shortAlert}</div>
              <p className="small" style={{ margin: '6px 0 0' }}>{a.details} Medication: {a.medicationLocation}.</p>
            </div>
          ))}
        </section>

        <section className="card" data-testid="search-contacts">
          {guardianLink === 'offline' && (
            <div className="banner danger" data-testid="guardians-stale">Can’t reach Peak Pals, so these contacts may be out of date.</div>
          )}
          <h3>Emergency contacts</h3>
          {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
            <p key={link.id}>
              <strong>{link.contactOrder}. {person.name}</strong> ({link.relationship})<br />
              <a href={`tel:${person.phone}`}>{person.phone}</a>
              <br />
              <span className={`chip ${link.canPickUp ? 'ok' : ''}`}>{link.canPickUp ? 'Can pick up' : 'Not allowed to pick up'}</span>
            </p>
          ))}
          <h3>Other adults allowed to pick up</h3>
          <p className="small">{adults.filter((x) => x.link.canPickUp && !x.link.contactOrder).map((x) => `${x.person.name} (${x.link.relationship})`).join(', ') || 'No one else'}</p>
        </section>
      </div>

      <section className="card">
        <div className="row between">
          <div data-testid="acks">
            <strong>Acknowledged:</strong>{' '}
            {acks.length === 0 ? <span className="muted">no one yet</span> : acks.map((a) => `${userName(data, a.patrollerId)} (${timeLabel(a.at)})`).join(', ')}
          </div>
          {!iAcked && <button className="primary" type="button" onClick={() => acknowledge(em.id)} data-testid="acknowledge">I’m on it</button>}
        </div>
      </section>

      <section className="card">
        {!closing ? (
          <button type="button" onClick={() => setClosing(true)} data-testid="close-search">Close search</button>
        ) : (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              closeSearch(em.id, outcome);
            }}
          >
            <label htmlFor="outcome" style={{ margin: 0 }}>Outcome</label>
            <select id="outcome" style={{ width: 'auto' }} value={outcome} onChange={(e) => setOutcome(e.target.value)} data-testid="close-outcome">
              <option>Found safe</option>
              <option>Found, needed first aid</option>
              <option>Handed over to police</option>
              <option>False alarm</option>
            </select>
            <button className="primary" type="submit" data-testid="close-confirm">Close search</button>
            <button className="ghost" type="button" onClick={() => setClosing(false)}>Cancel</button>
          </form>
        )}
      </section>
    </div>
  );
}
````

### changed: lib/server/guardians.ts

````
// Saving and reading a child's adults (guardians, emergency contacts, pickup adults)
// in Piezas. Server only: this file uses PIEZAS_API_KEY, so it must never be
// imported by a browser component.

import { Piezas } from '@piezas/sdk';
import { phoneProblem, formatPhone } from '@/lib/access';

// The same shape the screens use. `linkId` and `personId` are Piezas record ids
// once saved; anything else (a made-up preview id) means "not saved yet".
export type GuardianRow = {
  linkId: string;
  personId: string;
  childId: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  contactOrder: number | null;
  canPickUp: boolean;
};

type Entity = Awaited<ReturnType<typeof setUp>>['person'];
type Stored = Awaited<ReturnType<Entity['list']>>['data'][number];

const MAX_ADULTS_PER_CHILD = 30;
const PAGE_SIZE = 100;
const PIEZAS_RECORD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function setUp() {
  const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
  // Safe to repeat: existing record types are reused. "kk_" keeps these apart
  // from anything else stored in the same Piezas account.
  const { kk_person: person, kk_child_person: childPerson } = await piezas.defineEntities({
    kk_person: {
      fields: {
        name: { type: 'text', required: true },
        phone: { type: 'phone', required: true },
        email: { type: 'email' },
      },
    },
    kk_child_person: {
      fields: {
        childId: { type: 'text', required: true },
        personId: { type: 'text', required: true },
        relationship: { type: 'text', required: true },
        contactOrder: { type: 'integer' },
        canPickUp: { type: 'boolean', required: true },
      },
    },
  });
  return { person, childPerson };
}

let ready: ReturnType<typeof setUp> | null = null;
function records() {
  if (!ready) {
    ready = setUp().catch((err) => {
      ready = null; // try again on the next request rather than staying broken
      throw err;
    });
  }
  return ready;
}

/** Piezas returns at most 100 records per call, so keep asking until a short page. */
async function listAll(entity: Entity, filter?: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await entity.list({ limit: PAGE_SIZE, offset, ...(filter ? { filter } : {}) });
    all.push(...page.data);
    if (page.data.length < PAGE_SIZE) return all;
  }
}

function toRow(link: Stored, person: Stored | undefined): GuardianRow | null {
  if (!person) return null;
  return {
    linkId: link.id,
    personId: person.id,
    childId: String(link.data.childId),
    name: String(person.data.name ?? person.title),
    phone: String(person.data.phone ?? ''),
    email: String(person.data.email ?? ''),
    relationship: String(link.data.relationship ?? ''),
    contactOrder: typeof link.data.contactOrder === 'number' ? link.data.contactOrder : null,
    canPickUp: link.data.canPickUp === true,
  };
}

/** Every saved adult, for the children the caller is allowed to see. */
export async function readGuardians(allowedChild: (childId: string) => boolean): Promise<GuardianRow[]> {
  const { person, childPerson } = await records();
  const [links, people] = await Promise.all([listAll(childPerson), listAll(person)]);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return links
    .filter((l) => allowedChild(String(l.data.childId)))
    .map((l) => toRow(l, peopleById.get(String(l.data.personId))))
    .filter((r): r is GuardianRow => r !== null);
}

const personData = (r: GuardianRow) => ({ name: r.name, phone: r.phone, ...(r.email ? { email: r.email } : {}) });
const linkData = (r: GuardianRow, personId: string) => ({
  childId: r.childId,
  personId,
  relationship: r.relationship,
  canPickUp: r.canPickUp,
  ...(r.contactOrder !== null ? { contactOrder: r.contactOrder } : {}),
});

/**
 * Saves a child's list of adults: new ones are created and changed ones updated.
 * The whole list is sent because changing one contact's position can renumber
 * the others. Only adults explicitly named in `removedLinkIds` are deleted, so
 * an adult another parent added a moment ago is never erased by a stale list.
 */
export async function saveGuardians(childId: string, rows: GuardianRow[], removedLinkIds: string[]): Promise<GuardianRow[]> {
  const { person, childPerson } = await records();
  const existing = await listAll(childPerson, { childId });
  const existingById = new Map(existing.map((l) => [l.id, l]));
  const removing = new Set(removedLinkIds);

  for (const row of rows) {
    const link = existingById.get(row.linkId);
    if (link) {
      // The person id comes from what's stored, never from the browser.
      const personId = String(link.data.personId);
      await person.update(personId, { title: row.name, data: personData(row) });
      await childPerson.update(link.id, { title: `${row.name} for ${childId}`, data: linkData(row, personId) });
    } else {
      // A Piezas id that's no longer stored means someone removed this adult
      // while this browser still had the old list. Don't bring them back.
      if (PIEZAS_RECORD_ID.test(row.linkId)) continue;
      const created = await person.create({ title: row.name, data: personData(row) });
      await childPerson.create({ title: `${row.name} for ${childId}`, data: linkData(row, created.id) });
    }
  }

  for (const link of existing) {
    if (!removing.has(link.id)) continue;
    const personId = String(link.data.personId);
    await childPerson.delete(link.id);
    const others = await listAll(childPerson, { personId });
    if (others.length === 0) await person.delete(personId);
  }

  const [links, people] = await Promise.all([listAll(childPerson, { childId }), listAll(person)]);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return links.map((l) => toRow(l, peopleById.get(String(l.data.personId)))).filter((r): r is GuardianRow => r !== null);
}

/** Checks what the browser sent. Returns cleaned rows, or a message saying what's wrong. */
export function validateGuardians(childId: string, input: unknown): { rows: GuardianRow[] } | { problem: string } {
  if (!Array.isArray(input) || input.length > MAX_ADULTS_PER_CHILD) return { problem: 'The list of adults is not valid.' };
  if (input.length === 0) return { problem: 'Each child needs at least one adult on file. Add another adult before removing this one.' };
  const rows: GuardianRow[] = [];
  const positions = new Set<number>();
  for (const raw of input) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    const relationship = typeof r.relationship === 'string' ? r.relationship.trim() : '';
    const phone = typeof r.phone === 'string' ? r.phone : '';
    const email = typeof r.email === 'string' ? r.email.trim() : '';
    const order = r.contactOrder ?? null;
    if (!name || name.length > 120) return { problem: 'Enter a name for each adult.' };
    if (!relationship || relationship.length > 60) return { problem: `Say how ${name} is related to the child.` };
    const phoneIssue = phoneProblem(phone);
    if (phoneIssue) return { problem: `${name}: ${phoneIssue}` };
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { problem: `${name}: that email address isn't valid.` };
    if (order !== null && (!Number.isInteger(order) || (order as number) < 1 || positions.has(order as number))) {
      return { problem: 'The emergency contact order is not valid.' };
    }
    if (order !== null) positions.add(order as number);
    if (typeof r.canPickUp !== 'boolean') return { problem: 'Say whether each adult can pick up.' };
    rows.push({
      linkId: typeof r.linkId === 'string' ? r.linkId : '',
      personId: '',
      childId,
      name,
      phone: formatPhone(phone),
      email,
      relationship,
      contactOrder: order as number | null,
      canPickUp: r.canPickUp,
    });
  }
  return { rows };
}
````
