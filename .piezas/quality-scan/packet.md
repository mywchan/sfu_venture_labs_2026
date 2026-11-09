# Piezas quality scan packet

Scan code: qs-56ac4f56b7c408971f
Round: 1 of 3
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

1. [high] Anyone can still get into any role: the sign-in accepts any password with a code printed on the page, and buttons on the first screen open a parent, instructor, patrol or administrator account with no sign-in at all. (app/page.tsx)
2. [high] When someone reports a child missing, only that one browser window knows about it, so no patroller is alerted even though the reporter is told "Ski patrol has been alerted." (lib/store.tsx)
3. [high] A parent's new allergy, a signed consent form, a check-in, a clothing change, a pickup, a refused pickup, or the administrator's groups and spreadsheet upload never reach anyone else's screen and are lost on reload, so staff can act on old information. (lib/store.tsx)
4. [high] Every family's medical details and contacts are sent to the browser of every signed-in person, and only the screen layout hides them, so a parent, the desk or patrol with no open search could still get at them. (lib/store.tsx)
5. [high] Patrol is still given every family's saved contacts and pickup adults at all times, even when no search is open, instead of only during a search. (app/api/guardians/route.ts)
6. [high] On the live site parents cannot save or see saved contacts and pickup adults at all, and the desk and patrol would always see a "can't reach" warning, because that saving only works on the builder's own computer until real sign-in exists. (app/api/guardians/route.ts)
7. [high] Parents have no way to get an account: there is no welcome email or set-password page, the 6-digit code is never emailed, and the store spreadsheet does not link a new child to any parent. (app/admin/page.tsx)
8. [high] The administrator cannot create staff accounts or give anyone a role, so no real instructor, desk or patrol person can be added. (app/admin/page.tsx)
9. [high] An instructor who opens the app on the hill with no wifi gets nothing, because the saved group only shows if the page was already open and signed in when the connection dropped. (components/OfflineCopy.tsx)
10. [high] The app runs on a made-up clock that always says Saturday, December 12 and restarts at 1:35 p.m., so the police countdown, consent signing dates and the 4 p.m. delete would be wrong on a real day. (lib/store.tsx)
11. [high] The administrator can only change a child's name, level and day, and cannot edit the child's contacts, pickup adults, medical alerts or consent form. (app/admin/page.tsx)
12. [high] The administrator cannot manage lesson days or build groups for any day other than the one Saturday, and Sunday children cannot be found at the desk or placed in a group. (app/admin/page.tsx)
13. [high] The record of who viewed medical details or opened a child during a search stays only in that person's own browser window, so the administrator never sees it and it disappears on reload. (lib/store.tsx)
14. [medium] None of the 27 agreed checks has been written and no test run exists, so nothing the owner approved has been proven to work, and the test copy has no sample families to check against. (tests/scenarios)
15. [medium] If one parent turns off pickup permission for an adult and the other parent saves any change a few seconds later, that adult goes back to being approved for pickup with no warning to anyone. (lib/server/guardians.ts)
16. [medium] No child photo can be added anywhere, so patrol never sees a real photo during a search even when the parent gave photo consent, only the child's initials. (app/patrol/page.tsx)

## The change

Changed since the last scan (2026-11-09T00:38:06.355Z): 46 file(s) added or changed, 0 removed.

### added: app/api/today/route.ts

````
import { localOnly, notFound, previewCaller } from '@/lib/server/preview-caller';
import { perform, readToday, Refused } from '@/lib/server/today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failed(err: unknown) {
  if (err instanceof Refused) return Response.json({ error: err.message }, { status: err.status });
  // Details stay in the server log; the browser only gets a plain message.
  console.error('[today]', err);
  return Response.json({ error: 'Couldn’t reach Peak Pals, so that may not have saved. Please try again.' }, { status: 503 });
}

export async function GET(request: Request) {
  if (localOnly()) return notFound();
  const user = previewCaller(new URL(request.url).searchParams.get('as'));
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    return Response.json({ today: await readToday(user) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(request: Request) {
  if (localOnly()) return notFound();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const user = previewCaller(body?.as);
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    return Response.json({ today: await perform(user, body) });
  } catch (err) {
    return failed(err);
  }
}
````

### added: lib/server/preview-caller.ts

````
// TEMPORARY: real sign-in isn't built yet, so "who is asking" comes from the
// preview's made-up people. That can't be trusted on a real site, so routes
// using this don't exist outside local development. Replace `previewCaller`
// with the verified Piezas session before removing the production check.

import { seedData, type User } from '@/lib/seed/data';

export const localOnly = () => process.env.NODE_ENV === 'production';
export const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

export function previewCaller(id: unknown): User | null {
  return seedData.users.find((u) => u.id === id) ?? null;
}
````

### added: lib/server/today.ts

````
// Today's check-ins, pickups, refused pickups and the emergency log, saved in
// Piezas. Server only: this file uses PIEZAS_API_KEY. Every rule about who may
// do what is enforced here, not just hidden on screen.
//
// Children, groups and the preview's morning check-ins still come from the
// made-up list in lib/seed. A saved record always wins over the made-up one, and
// the made-up list is never copied into Piezas.

import { Piezas } from '@piezas/sdk';
import { groupForInstructor, parentOwnsChild } from '@/lib/access';
import {
  seedData,
  TODAY,
  TODAY_LESSON_DAY,
  type Attendance,
  type Emergency,
  type PatrolAck,
  type PickupRefusal,
  type User,
} from '@/lib/seed/data';
import { readGuardians } from './guardians';

export type TodayRows = {
  attendance: Attendance[];
  refusals: PickupRefusal[];
  emergencies: Emergency[];
  acks: PatrolAck[];
};

/** The request was understood but isn't allowed; `message` is shown to the person. */
export class Refused extends Error {
  constructor(
    message: string,
    readonly status: number = 409,
  ) {
    super(message);
  }
}

const PAGE_SIZE = 100;
const OUTCOMES = ['Found safe', 'Found, needed first aid', 'Handed over to police', 'False alarm'];
const WALL_CLOCK = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const HOUR_MINUTE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function setUp() {
  const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
  // Safe to repeat: existing record types are reused.
  const { kk_attendance: attendance, kk_pickup_refusal: refusal, kk_emergency: emergency, kk_patrol_ack: ack } = await piezas.defineEntities({
    kk_attendance: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        checkInAt: { type: 'text' },
        checkedInBy: { type: 'text' },
        jacket: { type: 'text' },
        pants: { type: 'text' },
        helmet: { type: 'text' },
        clothingFixedBy: { type: 'text' },
        clothingFixedAt: { type: 'text' },
        pickupAt: { type: 'text' },
        pickedUpBy: { type: 'text' },
        pickedUpName: { type: 'text' },
        releasedBy: { type: 'text' },
      },
    },
    kk_pickup_refusal: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        nameGiven: { type: 'text', required: true },
        at: { type: 'text', required: true },
        staffId: { type: 'text', required: true },
      },
    },
    // The emergency log: records are closed when a search ends, never deleted.
    kk_emergency: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        reportedBy: { type: 'text', required: true },
        reportedAt: { type: 'text', required: true },
        lastSeenPlace: { type: 'text', required: true },
        lastSeenAt: { type: 'text', required: true },
        jacket: { type: 'text' },
        pants: { type: 'text' },
        helmet: { type: 'text' },
        status: { type: 'text', required: true },
        sharedWithPoliceAt: { type: 'text' },
        sharedWithPoliceBy: { type: 'text' },
        noticeMailed: { type: 'boolean' },
        closedAt: { type: 'text' },
        closedBy: { type: 'text' },
        outcome: { type: 'text' },
      },
    },
    kk_patrol_ack: {
      fields: {
        emergencyId: { type: 'text', required: true },
        patrollerId: { type: 'text', required: true },
        at: { type: 'text', required: true },
      },
    },
  });
  return { attendance, refusal, emergency, ack };
}

type Entity = Awaited<ReturnType<typeof setUp>>['attendance'];
type Stored = Awaited<ReturnType<Entity['list']>>['data'][number];

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

/** Oldest first, so if two people act at once everyone agrees on which record counts. */
async function listAll(entity: Entity, filter: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await entity.list({ limit: PAGE_SIZE, offset, filter });
    all.push(...page.data);
    if (page.data.length < PAGE_SIZE) break;
  }
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const text = (v: unknown) => (typeof v === 'string' && v ? v : null);
const withoutBlanks = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));

function toAttendance(r: Stored): Attendance {
  const d = r.data;
  return {
    id: r.id,
    childId: String(d.childId),
    lessonDayId: String(d.lessonDayId),
    checkInAt: text(d.checkInAt),
    checkedInBy: text(d.checkedInBy),
    jacket: text(d.jacket) ?? '',
    pants: text(d.pants) ?? '',
    helmet: text(d.helmet) ?? '',
    clothingFixedBy: text(d.clothingFixedBy),
    clothingFixedAt: text(d.clothingFixedAt),
    pickupAt: text(d.pickupAt),
    pickedUpBy: text(d.pickedUpBy),
    pickedUpName: text(d.pickedUpName),
    releasedBy: text(d.releasedBy),
  };
}

function toEmergency(r: Stored): Emergency {
  const d = r.data;
  return {
    id: r.id,
    childId: String(d.childId),
    reportedBy: String(d.reportedBy),
    lastSeenPlace: String(d.lastSeenPlace),
    lastSeenAt: String(d.lastSeenAt),
    jacket: text(d.jacket) ?? 'Not recorded',
    pants: text(d.pants) ?? 'Not recorded',
    helmet: text(d.helmet) ?? 'Not recorded',
    status: d.status === 'closed' ? 'closed' : 'open',
    sharedWithPoliceAt: text(d.sharedWithPoliceAt),
    noticeMailed: d.noticeMailed === true,
    closedAt: text(d.closedAt),
    outcome: text(d.outcome),
  };
}

const toRefusal = (r: Stored): PickupRefusal => ({
  id: r.id,
  childId: String(r.data.childId),
  lessonDayId: String(r.data.lessonDayId),
  nameGiven: String(r.data.nameGiven),
  at: String(r.data.at),
  staffId: String(r.data.staffId),
});

const toAck = (r: Stored): PatrolAck => ({ emergencyId: String(r.data.emergencyId), patrollerId: String(r.data.patrollerId), at: String(r.data.at) });

const teaches = (user: User, childId: string) => user.role === 'instructor' && groupForInstructor(seedData, user).kids.some((c) => c.id === childId);

function seesAttendance(user: User, childId: string) {
  if (user.role === 'desk' || user.role === 'admin') return true;
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  return teaches(user, childId);
}

function seesSearch(user: User, childId: string) {
  if (user.role === 'desk' || user.role === 'admin' || user.role === 'patrol') return true;
  return teaches(user, childId);
}

/** Today's records, cut down to what this person's role is allowed to see. */
export async function readToday(user: User): Promise<TodayRows> {
  const { attendance, refusal, emergency, ack } = await records();
  const day = { lessonDayId: TODAY_LESSON_DAY };
  const staffOnly = user.role === 'desk' || user.role === 'admin';
  const [attendanceRows, refusalRows, emergencyRows, ackRows] = await Promise.all([
    user.role === 'patrol' ? [] : listAll(attendance, day),
    staffOnly ? listAll(refusal, day) : [],
    user.role === 'parent' ? [] : listAll(emergency, day),
    user.role === 'patrol' ? listAll(ack, {}) : [],
  ]);

  const onePerChild = new Map<string, Attendance>();
  for (const row of attendanceRows.map(toAttendance)) {
    if (!onePerChild.has(row.childId) && seesAttendance(user, row.childId)) onePerChild.set(row.childId, row);
  }
  const emergencies = emergencyRows.map(toEmergency).filter((e) => seesSearch(user, e.childId)).reverse();
  const emergencyIds = new Set(emergencies.map((e) => e.id));
  const seenAcks = new Set<string>();
  const acks = ackRows.map(toAck).filter((a) => {
    const key = `${a.emergencyId}|${a.patrollerId}`;
    if (seenAcks.has(key) || !emergencyIds.has(a.emergencyId)) return false;
    seenAcks.add(key);
    return true;
  });
  return { attendance: [...onePerChild.values()], refusals: refusalRows.map(toRefusal).reverse(), emergencies, acks };
}

/** Children patrol may currently see details for. */
export async function openSearchChildIds(): Promise<Set<string>> {
  const { emergency } = await records();
  const rows = await listAll(emergency, { lessonDayId: TODAY_LESSON_DAY });
  return new Set(rows.map(toEmergency).filter((e) => e.status === 'open').map((e) => e.childId));
}

/** The saved record for this child today, or else the preview's made-up one. */
async function currentAttendance(entity: Entity, childId: string) {
  const [record] = await listAll(entity, { childId, lessonDayId: TODAY_LESSON_DAY });
  if (record) return { record, row: toAttendance(record) };
  const seed = seedData.attendance.find((a) => a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY) ?? null;
  return { record: null, row: seed };
}

async function saveAttendance(entity: Entity, childId: string, record: Stored | null, row: Omit<Attendance, 'id'>) {
  const { id: _id, ...fields } = row as Attendance;
  const data = withoutBlanks(fields);
  if (record) await entity.update(record.id, { data });
  else await entity.create({ title: `${childId} on ${TODAY}`, data });
}

/** May this adult take this child home? Uses the saved list when the child has one. */
async function approvedPickupName(childId: string, personId: string): Promise<string | null> {
  const saved = await readGuardians((id) => id === childId);
  if (saved.length > 0) return saved.find((g) => g.personId === personId && g.canPickUp)?.name ?? null;
  const link = seedData.childPersons.find((cp) => cp.childId === childId && cp.personId === personId && cp.canPickUp);
  return link ? (seedData.persons.find((p) => p.id === personId)?.name ?? null) : null;
}

function field(raw: Record<string, unknown>, name: string, max: number, label: string) {
  const value = typeof raw[name] === 'string' ? (raw[name] as string).trim() : '';
  if (!value || value.length > max) throw new Refused(`Please check ${label}.`, 422);
  return value;
}

function clockTime(raw: Record<string, unknown>) {
  // The preview's made-up clock. When the real clock arrives, the server sets this.
  const at = raw.at;
  if (typeof at !== 'string' || !WALL_CLOCK.test(at)) throw new Refused('The time on this request is not valid.', 422);
  return at;
}

function requireRole(user: User, allowed: boolean) {
  if (!allowed) throw new Refused('Your account can’t do that.', 403);
}

/** Carries out one action, then returns today's records for this person. */
export async function perform(user: User, raw: Record<string, unknown>): Promise<TodayRows> {
  const { attendance, refusal, emergency, ack } = await records();
  const action = raw.action;

  if (action === 'acknowledge' || action === 'shareWithPolice' || action === 'markNoticeMailed' || action === 'closeSearch') {
    requireRole(user, user.role === 'patrol');
    const emergencyId = field(raw, 'emergencyId', 64, 'the search');
    const all = await listAll(emergency, { lessonDayId: TODAY_LESSON_DAY });
    const record = all.find((r) => r.id === emergencyId);
    if (!record) throw new Refused('Not found', 404);
    const em = toEmergency(record);

    if (action === 'markNoticeMailed') {
      if (!em.sharedWithPoliceAt) throw new Refused('No notice is needed: details weren’t shared with police.');
      await emergency.update(record.id, { data: { ...record.data, noticeMailed: true } });
      return readToday(user);
    }
    if (em.status !== 'open') throw new Refused('This search has already been closed.');
    const at = clockTime(raw);

    if (action === 'acknowledge') {
      const existing = await listAll(ack, { emergencyId, patrollerId: user.id });
      if (existing.length === 0) await ack.create({ title: `${user.name} on ${em.childId}`, data: { emergencyId, patrollerId: user.id, at } });
    } else if (action === 'shareWithPolice') {
      if (!em.sharedWithPoliceAt) await emergency.update(record.id, { data: { ...record.data, sharedWithPoliceAt: at, sharedWithPoliceBy: user.id } });
    } else {
      const outcome = field(raw, 'outcome', 60, 'the outcome');
      if (!OUTCOMES.includes(outcome)) throw new Refused('Please choose an outcome from the list.', 422);
      // Two people reporting at the same moment can open two entries; end them together.
      for (const open of all.filter((r) => toEmergency(r).status === 'open' && r.data.childId === em.childId)) {
        await emergency.update(open.id, { data: { ...open.data, status: 'closed', closedAt: at, closedBy: user.id, outcome } });
      }
    }
    return readToday(user);
  }

  const childId = typeof raw.childId === 'string' ? raw.childId : '';
  if (!seedData.children.some((c) => c.id === childId)) throw new Refused('Not found', 404);
  const openFor = async () => (await listAll(emergency, { childId, lessonDayId: TODAY_LESSON_DAY })).filter((r) => toEmergency(r).status === 'open');
  const at = clockTime(raw);

  if (action === 'checkIn' || action === 'fixClothing') {
    requireRole(user, action === 'checkIn' ? user.role === 'desk' : teaches(user, childId));
    const clothing = {
      jacket: field(raw, 'jacket', 40, 'the jacket colour'),
      pants: field(raw, 'pants', 40, 'the pants colour'),
      helmet: field(raw, 'helmet', 40, 'the helmet colour'),
    };
    const { record, row } = await currentAttendance(attendance, childId);

    if (action === 'checkIn') {
      if (!row?.checkInAt) {
        await saveAttendance(attendance, childId, record, {
          childId,
          lessonDayId: TODAY_LESSON_DAY,
          checkInAt: at,
          checkedInBy: user.id,
          ...clothing,
          pickupAt: null,
          pickedUpBy: null,
          releasedBy: null,
        });
      }
      return readToday(user);
    }

    if (!row?.checkInAt || row.pickupAt) throw new Refused('Clothing can only be corrected while the child is checked in.');
    await saveAttendance(attendance, childId, record, { ...row, ...clothing, clothingFixedBy: user.id, clothingFixedAt: at });
    // A correction during a search has to reach patrol too.
    for (const open of await openFor()) await emergency.update(open.id, { data: { ...open.data, ...clothing } });
    return readToday(user);
  }

  if (action === 'release') {
    requireRole(user, user.role === 'desk');
    const { record, row } = await currentAttendance(attendance, childId);
    if (!row?.checkInAt) throw new Refused('This child hasn’t been checked in.');
    if (row.pickupAt) throw new Refused('This child has already gone home.');
    if ((await openFor()).length > 0) throw new Refused('Ski patrol is searching for this child. Do not release them.');
    const personId = field(raw, 'personId', 64, 'the adult');
    const name = await approvedPickupName(childId, personId);
    if (!name) throw new Refused('This adult is no longer on the pickup list. Do not release the child. Call a parent.');
    await saveAttendance(attendance, childId, record, { ...row, pickupAt: at, pickedUpBy: personId, pickedUpName: name, releasedBy: user.id });
    return readToday(user);
  }

  if (action === 'refusePickup') {
    requireRole(user, user.role === 'desk');
    const nameGiven = field(raw, 'nameGiven', 120, 'the name');
    await refusal.create({ title: `${nameGiven} refused for ${childId}`, data: { childId, lessonDayId: TODAY_LESSON_DAY, nameGiven, at, staffId: user.id } });
    return readToday(user);
  }

  if (action === 'reportMissing') {
    requireRole(user, user.role === 'desk' || user.role === 'admin' || teaches(user, childId));
    const lastSeenPlace = field(raw, 'lastSeenPlace', 200, 'where they were last seen');
    const lastSeenTime = typeof raw.lastSeenTime === 'string' ? raw.lastSeenTime : '';
    if (!HOUR_MINUTE.test(lastSeenTime)) throw new Refused('Please check the time they were last seen.', 422);
    // Already being searched for: don't start a second search.
    if ((await openFor()).length === 0) {
      const { row } = await currentAttendance(attendance, childId);
      await emergency.create({
        title: `Missing: ${childId}`,
        data: withoutBlanks({
          childId,
          lessonDayId: TODAY_LESSON_DAY,
          reportedBy: user.id,
          reportedAt: at,
          lastSeenPlace,
          lastSeenAt: `${TODAY}T${lastSeenTime}:00`,
          jacket: row?.jacket || 'Not recorded',
          pants: row?.pants || 'Not recorded',
          helmet: row?.helmet || 'Not recorded',
          status: 'open',
          noticeMailed: false,
        }),
      });
    }
    return readToday(user);
  }

  throw new Refused('That request could not be read.', 400);
}
````

### added: scripts/today.mjs

````
// Shows today's check-ins and the emergency log, straight from Piezas.
//   npm run data:today
//   npm run data:reset-today   (permanently deletes the preview day's records, for re-testing)
import { Piezas } from '@piezas/sdk';

const LESSON_DAY = 'day-2026-12-12'; // the preview's made-up day; other days are never touched
const reset = process.argv[2] === 'reset';
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY });
const t = { type: 'text' };
const required = { type: 'text', required: true };

// Keep these fields in step with lib/server/today.ts.
const { kk_attendance: attendance, kk_pickup_refusal: refusal, kk_emergency: emergency, kk_patrol_ack: ack } = await piezas.defineEntities(
  {
    kk_attendance: {
      fields: { childId: required, lessonDayId: required, checkInAt: t, checkedInBy: t, jacket: t, pants: t, helmet: t, clothingFixedBy: t, clothingFixedAt: t, pickupAt: t, pickedUpBy: t, pickedUpName: t, releasedBy: t },
    },
    kk_pickup_refusal: { fields: { childId: required, lessonDayId: required, nameGiven: required, at: required, staffId: required } },
    kk_emergency: {
      fields: {
        childId: required, lessonDayId: required, reportedBy: required, reportedAt: required, lastSeenPlace: required, lastSeenAt: required,
        jacket: t, pants: t, helmet: t, status: required, sharedWithPoliceAt: t, sharedWithPoliceBy: t, noticeMailed: { type: 'boolean' }, closedAt: t, closedBy: t, outcome: t,
      },
    },
    kk_patrol_ack: { fields: { emergencyId: required, patrollerId: required, at: required } },
  },
  { onDrift: 'ignore' },
);

async function listAll(entity, filter) {
  const all = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, filter });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

const day = { lessonDayId: LESSON_DAY };
const [attendanceRows, refusalRows, emergencyRows, ackRows] = await Promise.all([listAll(attendance, day), listAll(refusal, day), listAll(emergency, day), listAll(ack, {})]);
const emergencyIds = new Set(emergencyRows.map((e) => e.id));
const dayAcks = ackRows.filter((a) => emergencyIds.has(a.data.emergencyId));

if (reset) {
  for (const [entity, rows] of [[attendance, attendanceRows], [refusal, refusalRows], [ack, dayAcks], [emergency, emergencyRows]]) {
    for (const row of rows) await entity.delete(row.id);
  }
  console.log(`\nCleared the preview day: ${attendanceRows.length} check-ins, ${refusalRows.length} refused pickups, ${emergencyRows.length} searches, ${dayAcks.length} acknowledgements.\n`);
  process.exit(0);
}

console.log(`\nCheck-ins and pickups saved in Piezas: ${attendanceRows.length}`);
if (attendanceRows.length) {
  console.table(attendanceRows.map(({ data: d }) => ({ child: d.childId, 'checked in': d.checkInAt?.slice(11, 16) ?? '', by: d.checkedInBy ?? '', jacket: d.jacket, pants: d.pants, helmet: d.helmet, 'went home': d.pickupAt?.slice(11, 16) ?? '', with: d.pickedUpName ?? '', released: d.releasedBy ?? '' })));
}
console.log(`\nRefused pickups saved in Piezas: ${refusalRows.length}`);
if (refusalRows.length) console.table(refusalRows.map(({ data: d }) => ({ child: d.childId, 'name given': d.nameGiven, at: d.at.slice(11, 16), staff: d.staffId })));
console.log(`\nEmergency log saved in Piezas: ${emergencyRows.length}`);
if (emergencyRows.length) {
  console.table(emergencyRows.map((e) => ({ child: e.data.childId, status: e.data.status, 'reported by': e.data.reportedBy, 'last seen': e.data.lastSeenPlace, at: e.data.lastSeenAt.slice(11, 16), 'on it': dayAcks.filter((a) => a.data.emergencyId === e.id).map((a) => a.data.patrollerId).join(', '), outcome: e.data.outcome ?? '', saved: e.updatedAt })));
}
console.log('');
````

### changed: app/api/guardians/route.ts

````
import { LAST_ADULT, readGuardians, saveGuardians, validateGuardians } from '@/lib/server/guardians';
import { localOnly, notFound, previewCaller } from '@/lib/server/preview-caller';
import { openSearchChildIds } from '@/lib/server/today';
import { parentOwnsChild } from '@/lib/access';
import { seedData, type User } from '@/lib/seed/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read rules from the permissions table. Patrol only gets a child's adults
// while a search for that child is open.
function canRead(user: User, childId: string, searching: Set<string>) {
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  if (user.role === 'patrol') return searching.has(childId);
  return user.role === 'desk' || user.role === 'admin';
}

function canEdit(user: User, childId: string) {
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  return user.role === 'admin';
}

function failed(err: unknown) {
  // Details stay in the server log; the browser only gets a plain message.
  console.error('[guardians]', err);
  return Response.json({ error: 'Couldn’t finish saving to Peak Pals, so some changes may be missing. Please reload the page and check.' }, { status: 503 });
}

export async function GET(request: Request) {
  if (localOnly()) return notFound();
  const user = previewCaller(new URL(request.url).searchParams.get('as'));
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    const searching = user.role === 'patrol' ? await openSearchChildIds() : new Set<string>();
    return Response.json({ guardians: await readGuardians((childId) => canRead(user, childId, searching)) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function PUT(request: Request) {
  if (localOnly()) return notFound();
  let body: { as?: unknown; childId?: unknown; guardians?: unknown; removedLinkIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const user = previewCaller(body.as);
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  const childId = typeof body.childId === 'string' ? body.childId : '';
  // Someone else's child looks the same as a child that doesn't exist.
  if (!seedData.children.some((c) => c.id === childId) || !canEdit(user, childId)) return notFound();

  const removed = Array.isArray(body.removedLinkIds) ? body.removedLinkIds.filter((id): id is string => typeof id === 'string') : [];
  const checked = validateGuardians(childId, body.guardians);
  if ('problem' in checked) return Response.json({ error: checked.problem }, { status: 422 });
  try {
    const guardians = await saveGuardians(childId, checked.rows, removed);
    if (!guardians) return Response.json({ error: LAST_ADULT }, { status: 422 });
    return Response.json({ guardians });
  } catch (err) {
    return failed(err);
  }
}
````

### changed: app/api/piezas/report/route.ts

````
import { Piezas, createReportProblemRoute } from '@piezas/sdk';

// Added by Piezas: saves "Report a problem" reports in this app's own records.
// Keep it: whether the button shows is the owner's answer at each deploy.
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
const route = createReportProblemRoute({ piezas });

// Wrapped because Next.js requires the request argument to be non-optional.
export function GET(request: Request) {
  return route.GET(request);
}

export function POST(request: Request) {
  return route.POST(request);
}
````

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Runs a save; the panel stays put and shows the reason if it fails. */
  const save = async (work: () => Promise<void>, ifFailed = '') => {
    setSaving(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(`${ifFailed}${err instanceof Error ? err.message : 'That didn’t save.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" data-testid="desk-child-panel">
      <h2>{fullName(child)}</h2>
      <p className="muted small">Bib {child.bib} · Level {child.level} · {group ? `${group.name}, ${userName(data, group.instructorId)}` : 'No group yet'}</p>

      {search && <div className="banner danger">Ski patrol is searching for {child.firstName}.</div>}
      {error && <div className="banner danger" data-testid="desk-save-error">{error}</div>}

      {!a?.checkInAt && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clothingDone || saving) return;
            void save(() => checkIn(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() }));
          }}
          data-testid="checkin-form"
        >
          <h3>Check in</h3>
          <p className="small muted">Note today’s clothing: patrol uses it if {child.firstName} goes missing.</p>
          <ColourPicker id="jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="checkin-jacket" />
          <ColourPicker id="pants" label="Pants colour" value={pants} onChange={setPants} testId="checkin-pants" />
          <ColourPicker id="helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="checkin-helmet" />
          <button className="primary big" type="submit" disabled={!clothingDone || saving} data-testid="checkin-submit">{saving ? 'Saving…' : `Check in ${child.firstName}`}</button>
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
          Went home at {timeLabel(a.pickupAt)} with {a.pickedUpName ?? data.persons.find((p) => p.id === a.pickedUpBy)?.name}, released by {userName(data, a.releasedBy)}
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
              {refused} is NOT on {child.firstName}’s pickup list. Do not release {child.firstName}. Call a parent below.
            </div>
          )}
          {onList && (
            <div className="banner ok" data-testid="pickup-on-list">
              {onList} is on {child.firstName}’s pickup list. Check their photo ID, then use their Release button.
            </div>
          )}
          <div className="stack">
            {adults.filter((x) => x.link.canPickUp).map(({ person, link }) => (
              <button key={link.id} type="button" className="big" style={{ justifyContent: 'space-between' }} disabled={saving} onClick={() => void save(() => release(child.id, person.id))} data-testid={`release-to-${person.name}`}>
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
                  // The warning shows straight away; only the record of it waits for the save.
                  const nameGiven = otherName.trim();
                  void save(() => refusePickup(child.id, nameGiven), 'The warning stands, but this attempt wasn’t recorded. ');
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

### changed: app/instructor/page.tsx

````
'use client';

import { useEffect, useRef, useState } from 'react';
import { OfflineCopyCard, OfflineCopyView, useOfflineCopy, useOnline } from '@/components/OfflineCopy';
import { ColourPicker } from '@/components/ColourPicker';
import { ReportMissing } from '@/components/ReportMissing';
import { Shell } from '@/components/Shell';
import { ageOn, fullName, groupForInstructor, openSearchFor, timeLabel, todaysAttendance, userName } from '@/lib/access';
import { TODAY, type Child, type MedicalAlert } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function InstructorHome() {
  return (
    <Shell role="instructor" narrow>
      <MyGroup />
    </Shell>
  );
}

function MyGroup() {
  const { data, me } = useStore();
  const { group, kids } = groupForInstructor(data, me!);
  const [detail, setDetail] = useState<{ child: Child; alert: MedicalAlert } | null>(null);
  const [missing, setMissing] = useState<Child | null>(null);
  const [fixing, setFixing] = useState<Child | null>(null);
  const { copy, save, remove } = useOfflineCopy(me!);
  const online = useOnline();
  const [viewingCopy, setViewingCopy] = useState(false);

  // With no connection, the saved copy is all there is.
  if (copy && (!online || viewingCopy)) {
    return <OfflineCopyView copy={copy} online={online} onBack={() => setViewingCopy(false)} />;
  }

  if (!group) {
    return (
      <div className="card">
        <h1>No group today</h1>
        <p>You aren’t teaching a group today. Check with the snow school office.</p>
      </div>
    );
  }

  return (
    <>
      <h1 data-testid="group-title">{group.name} · Level {group.level}</h1>
      <p className="muted">{kids.length} children today. Tap an alert for details.</p>
      <OfflineCopyCard copy={copy} onSave={save} onRemove={remove} onView={() => setViewingCopy(true)} />
      <div data-testid="group-list">
        {kids.map((c) => {
          const alerts = data.medical.filter((m) => m.childId === c.id);
          const att = todaysAttendance(data, c.id);
          const search = openSearchFor(data, c.id);
          return (
            <div className="kid-row" key={c.id} data-testid={`group-child-${c.id}`}>
              <div className="row between">
                <div>
                  <div className="name">{fullName(c)}</div>
                  <div className="small muted">
                    Age {ageOn(c.birthDate, TODAY)} · Bib {c.bib}
                    {att?.checkInAt ? ` · ${att.jacket} jacket, ${att.pants} pants, ${att.helmet} helmet` : ''}
                  </div>
                </div>
                {search ? (
                  <span className="chip danger">Missing · patrol searching</span>
                ) : att?.pickupAt ? (
                  <span className="chip">Gone home</span>
                ) : att?.checkInAt ? (
                  <span className="chip ok">Here</span>
                ) : (
                  <span className="chip warn">Not checked in</span>
                )}
              </div>
              {alerts.map((a) => (
                <button key={a.id} type="button" className={`alert-line ${a.severity}`} onClick={() => setDetail({ child: c, alert: a })} data-testid={`alert-${c.id}`}>
                  ⚠ {a.shortAlert}
                </button>
              ))}
              {att?.clothingFixedAt && (
                <div className="small muted" data-testid={`clothing-fixed-${c.id}`}>Clothing corrected at {timeLabel(att.clothingFixedAt)} by {userName(data, att.clothingFixedBy ?? null)}</div>
              )}
              {att?.checkInAt && !att.pickupAt && (
                <div className="row">
                  <button type="button" className="ghost small" onClick={() => setFixing(c)} data-testid={`fix-clothing-${c.id}`}>
                    Fix clothing
                  </button>
                  {!search && (
                    <button type="button" className="ghost small" style={{ color: 'var(--danger)' }} onClick={() => setMissing(c)} data-testid={`report-missing-${c.id}`}>
                      Report missing
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {detail && <MedicalDetail child={detail.child} alert={detail.alert} onClose={() => setDetail(null)} />}
      {missing && <ReportMissing child={missing} onClose={() => setMissing(null)} />}
      {fixing && <FixClothing child={fixing} onClose={() => setFixing(null)} />}
    </>
  );
}

function FixClothing({ child, onClose }: { child: Child; onClose: () => void }) {
  const { data, fixClothing } = useStore();
  const att = todaysAttendance(data, child.id);
  const [jacket, setJacket] = useState(att?.jacket ?? '');
  const [pants, setPants] = useState(att?.pants ?? '');
  const [helmet, setHelmet] = useState(att?.helmet ?? '');
  const complete = Boolean(jacket.trim() && pants.trim() && helmet.trim());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="fix-title" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!complete || saving) return;
          setSaving(true);
          setError(null);
          try {
            await fixClothing(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'That didn’t save.');
            setSaving(false);
          }
        }}
        data-testid="fix-clothing-sheet"
      >
        <h2 id="fix-title">What is {child.firstName} wearing now?</h2>
        <p className="small muted">Ski patrol uses this if {child.firstName} goes missing. Your name is recorded with the change.</p>
        <ColourPicker id="fix-jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="fix-jacket" />
        <ColourPicker id="fix-pants" label="Pants colour" value={pants} onChange={setPants} testId="fix-pants" />
        <ColourPicker id="fix-helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="fix-helmet" />
        {error && <div className="banner danger" data-testid="fix-clothing-error">{error}</div>}
        <button className="big primary" type="submit" disabled={!complete || saving} data-testid="fix-clothing-save">{saving ? 'Saving…' : 'Save'}</button>
        <button className="ghost" type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
      </form>
    </div>
  );
}

function MedicalDetail({ child, alert, onClose }: { child: Child; alert: MedicalAlert; onClose: () => void }) {
  const { logAccess } = useStore();
  // Recorded once, when the details are opened.
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logAccess(`Viewed medical details: ${alert.shortAlert}`, child.id);
  }, [logAccess, alert.shortAlert, child.id]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-testid="medical-detail">
        <h2>{fullName(child)}</h2>
        <div className={`alert-line ${alert.severity}`}>{alert.shortAlert}</div>
        <p style={{ marginTop: 12 }}>{alert.details || 'No further details.'}</p>
        <p><strong>Medication:</strong> {alert.medicationLocation}</p>
        <p className="small muted">This view was recorded. Medical details are only for keeping {child.firstName} safe today.</p>
        <button className="big primary" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
````

### changed: app/layout.tsx

````
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import './globals.css';
import { ReportProblem } from './report-problem';

export const metadata: Metadata = {
  title: 'Kestrel Kids Portal',
  description: 'The right information about each child, for the right people, at the right time.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="preview-banner" data-testid="preview-banner">
          Preview with made-up children. Adults on file, check-ins, pickups and missing reports are saved. Other changes reset when you reload the page.
        </div>
        <StoreProvider>{children}</StoreProvider>
        <ReportProblem />
      </body>
    </html>
  );
}
````

### changed: app/parent/[childId]/page.tsx

````
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
  const [closedError, setClosedError] = useState<string | null>(null);
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
          {closedError && <div className="banner danger" data-testid="closed-error">{closedError}</div>}
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
                        <button type="button" onClick={() => markNoticeMailed(e.id).then(() => setClosedError(null), (err: Error) => setClosedError(err.message))}>To mail · mark done</button>
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Runs a save; the search stays on screen and shows the reason if it fails. */
  const save = async (work: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
      {error && <div className="banner danger" data-testid="search-save-error">{error}</div>}

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
            <button type="button" disabled={saving} onClick={() => void save(() => shareWithPolice(em.id))} data-testid="share-police">Record: details shared with police</button>
          ) : (
            <div className="stack">
              <div className="banner warn" data-testid="police-shared">Shared with police at {timeLabel(em.sharedWithPoliceAt)}</div>
              {!em.noticeMailed ? (
                <div className="row between card" style={{ margin: 0 }} data-testid="notice-todo">
                  <span>Mail a notice to the family (privacy law)</span>
                  <button type="button" disabled={saving} onClick={() => void save(() => markNoticeMailed(em.id))}>Mark done</button>
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
          {!iAcked && <button className="primary" type="button" disabled={saving} onClick={() => void save(() => acknowledge(em.id))} data-testid="acknowledge">I’m on it</button>}
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
              void save(() => closeSearch(em.id, outcome));
            }}
          >
            <label htmlFor="outcome" style={{ margin: 0 }}>Outcome</label>
            <select id="outcome" style={{ width: 'auto' }} value={outcome} onChange={(e) => setOutcome(e.target.value)} data-testid="close-outcome">
              <option>Found safe</option>
              <option>Found, needed first aid</option>
              <option>Handed over to police</option>
              <option>False alarm</option>
            </select>
            <button className="primary" type="submit" disabled={saving} data-testid="close-confirm">Close search</button>
            <button className="ghost" type="button" onClick={() => setClosing(false)}>Cancel</button>
          </form>
        )}
      </section>
    </div>
  );
}
````

### changed: app/report-problem.tsx

````
'use client';
import { mountReportProblem } from '@piezas/sdk/report-problem';

// Added by Piezas. Mounted when this file loads, outside React, so the button
// outlives a crash. Whether it shows is the owner's answer at each deploy.
if (typeof window !== 'undefined') mountReportProblem();

export function ReportProblem() {
  return null;
}
````

### changed: components/ReportMissing.tsx

````
'use client';

import { useState } from 'react';
import { fullName, openSearchFor } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

/** One-step "report missing" sheet, used by instructors, the desk and the administrator. */
export function ReportMissing({ child, onClose }: { child: Child; onClose: () => void }) {
  const { now, reportMissing, data } = useStore();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const [place, setPlace] = useState('');
  const [time, setTime] = useState(`${hh}:${mm}`);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const already = openSearchFor(data, child.id);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rm-title" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-testid="report-missing-sheet">
        {done || already ? (
          <>
            <div className="banner danger" data-testid="report-missing-sent">Ski patrol has been alerted.</div>
            <p>Stay where {child.firstName} was last seen if you can, and keep your radio on.</p>
            <button className="big primary" type="button" onClick={onClose}>OK</button>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!place.trim() || sending) return;
              setSending(true);
              setError(null);
              try {
                await reportMissing(child.id, place.trim(), time);
                setDone(true); // only say patrol was alerted once it's really saved
              } catch (err) {
                setError(err instanceof Error ? err.message : 'That didn’t save.');
              } finally {
                setSending(false);
              }
            }}
          >
            <h2 id="rm-title">Report {fullName(child)} missing</h2>
            <p className="small muted">Every patroller is alerted the moment you send this.</p>
            <div className="field">
              <label htmlFor="rm-place">Where were they last seen?</label>
              <input id="rm-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Top of the Pigeon chair" autoFocus data-testid="report-missing-place" />
            </div>
            <div className="field">
              <label htmlFor="rm-time">When?</label>
              <input id="rm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} data-testid="report-missing-time" />
            </div>
            {error && (
              <div className="banner danger" data-testid="report-missing-error">
                Ski patrol has NOT been alerted. Radio patrol now, then try again. ({error})
              </div>
            )}
            <button className="big danger" type="submit" disabled={!place.trim() || sending} data-testid="report-missing-send">{sending ? 'Alerting…' : 'Alert ski patrol now'}</button>
            <button className="ghost" type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
````

### changed: components/Shell.tsx

````
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
  const { me, now, signOut, sessionChecked, liveLink } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Wait until we know who is signed in, so a reload stays on the same page.
    if (!sessionChecked) return;
    if (!me) router.replace('/');
    else if (me.role !== role) router.replace(ROLE_HOME[me.role]);
  }, [me, role, router, sessionChecked]);

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
      <main className={narrow ? 'narrow' : undefined}>
        {role !== 'parent' && liveLink === 'offline' && (
          <div className="banner danger" data-testid="live-stale">
            Can’t reach Peak Pals, so this screen may be out of date and new entries may not save. Use your radio for anything urgent.
          </div>
        )}
        {children}
      </main>
    </>
  );
}
````

### changed: lib/seed/data.ts

````
// Made-up information for the preview. Every name, phone number and email is
// invented (example.test addresses never receive mail). Nothing here is stored
// in Piezas yet: the preview reads this module directly.

export type Role = 'parent' | 'instructor' | 'desk' | 'patrol' | 'admin';

export type User = { id: string; name: string; email: string; role: Role };

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  level: number; // 1 to 6
  programDay: 'Saturday' | 'Sunday';
  orderNumber: string; // online store order number, used to match the nightly spreadsheet
  bib: number;
  noMedicalConditions: boolean; // parent answered "none"
};

export type Person = { id: string; name: string; phone: string; email: string };

export type ChildPerson = {
  id: string;
  childId: string;
  personId: string;
  relationship: string;
  contactOrder: number | null; // 1 is called first; no upper limit
  canPickUp: boolean;
};

export type ParentAccount = { userId: string; childId: string };

export type Severity = 'high' | 'medium' | 'low';

export type MedicalAlert = {
  id: string;
  childId: string;
  shortAlert: string;
  details: string;
  medicationLocation: string;
  severity: Severity;
};

export type ConsentForm = { childId: string; signedBy: string; signedDate: string; photoConsent: boolean };

export type LessonDay = { id: string; date: string; programDay: 'Saturday' | 'Sunday' };

export type Group = { id: string; lessonDayId: string; name: string; level: number; instructorId: string };

export type GroupMember = { groupId: string; childId: string };

export type Attendance = {
  id: string;
  childId: string;
  lessonDayId: string;
  checkInAt: string | null;
  checkedInBy: string | null;
  jacket: string;
  pants: string;
  helmet: string;
  clothingFixedBy?: string | null; // user id of whoever last corrected the clothing
  clothingFixedAt?: string | null;
  pickupAt: string | null;
  pickedUpBy: string | null; // person id
  pickedUpName?: string | null; // their name at the time, kept even if they're later removed
  releasedBy: string | null; // user id
};

export type PickupRefusal = {
  id: string;
  childId: string;
  lessonDayId: string;
  nameGiven: string;
  at: string;
  staffId: string;
};

export type Emergency = {
  id: string;
  childId: string;
  reportedBy: string;
  lastSeenPlace: string;
  lastSeenAt: string;
  jacket: string;
  pants: string;
  helmet: string;
  status: 'open' | 'closed';
  sharedWithPoliceAt: string | null;
  noticeMailed: boolean;
  closedAt: string | null;
  outcome: string | null;
};

export type PatrolAck = { emergencyId: string; patrollerId: string; at: string };

export type AccessRecord = { id: string; userId: string; role: Role; what: string; childId: string; at: string };

export type Data = {
  users: User[];
  children: Child[];
  persons: Person[];
  childPersons: ChildPerson[];
  parentAccounts: ParentAccount[];
  medical: MedicalAlert[];
  consents: ConsentForm[];
  lessonDays: LessonDay[];
  groups: Group[];
  groupMembers: GroupMember[];
  attendance: Attendance[];
  refusals: PickupRefusal[];
  emergencies: Emergency[];
  acks: PatrolAck[];
  accessRecords: AccessRecord[];
};

// The preview pretends today is the first Saturday of lessons.
export const TODAY = '2026-12-12';
export const TODAY_LESSON_DAY = 'day-2026-12-12';

const at = (hhmm: string) => `${TODAY}T${hhmm}:00`;

export const users: User[] = [
  { id: 'u-melissa', name: 'Melissa Parr', email: 'm.parr@example.test', role: 'parent' },
  { id: 'u-jun', name: 'Jun Chen', email: 'jun.chen@example.test', role: 'parent' },
  { id: 'u-claire', name: 'Claire Moreau', email: 'claire.moreau@example.test', role: 'parent' },
  { id: 'u-fatima', name: 'Fatima Ahmed', email: 'fatima.ahmed@example.test', role: 'parent' },
  { id: 'u-sam', name: 'Sam Lee', email: 'sam.lee@example.test', role: 'instructor' },
  { id: 'u-priya', name: 'Priya Natt', email: 'priya.natt@example.test', role: 'instructor' },
  { id: 'u-jordan', name: 'Jordan Blake', email: 'jordan.blake@example.test', role: 'instructor' },
  { id: 'u-mei', name: 'Mei Tanaka', email: 'mei.tanaka@example.test', role: 'desk' },
  { id: 'u-rob', name: 'Rob Fournier', email: 'rob.fournier@example.test', role: 'patrol' },
  { id: 'u-kai', name: 'Kai Andersen', email: 'kai.andersen@example.test', role: 'patrol' },
  { id: 'u-hana', name: 'Hana Sato', email: 'hana.sato@example.test', role: 'admin' },
];

type ChildSeed = [id: string, first: string, last: string, birth: string, level: number, bib: number, noMedical: boolean];

const childSeeds: ChildSeed[] = [
  // Group A, level 3, Sam Lee
  ['c-owen', 'Owen', 'Okafor-Parr', '2017-06-14', 3, 101, false],
  ['c-ava', 'Ava', 'Moreau', '2019-03-02', 3, 102, false],
  ['c-noah', 'Noah', 'Singh', '2018-09-21', 3, 103, true],
  ['c-chloe', 'Chloe', 'Wong', '2018-01-30', 3, 104, true],
  ['c-ethan', 'Ethan', 'Brown', '2017-11-08', 3, 105, true],
  // Group B, level 1, Priya Natt
  ['c-lily', 'Lily', 'Chen', '2020-04-17', 1, 201, true],
  ['c-mateo', 'Mateo', 'Garcia', '2020-07-05', 1, 202, true],
  ['c-zoe', 'Zoe', 'Ahmed', '2020-02-11', 1, 203, false],
  ['c-liam', 'Liam', 'Murphy', '2019-12-24', 1, 204, true],
  ['c-isla', 'Isla', 'Kaur', '2020-08-19', 1, 205, true],
  ['c-ben', 'Ben', 'Li', '2020-05-03', 1, 206, true],
  // Group C, level 5, Jordan Blake
  ['c-maya', 'Maya', 'Thompson', '2015-10-12', 5, 301, false],
  ['c-lucas', 'Lucas', 'Dubois', '2016-03-28', 5, 302, true],
  ['c-aria', 'Aria', 'Patel', '2015-06-09', 5, 303, true],
  ['c-jack', 'Jack', 'Wilson', '2016-01-15', 5, 304, true],
  // Registered, not yet placed in a group
  ['c-emma', 'Emma', 'Nguyen', '2018-05-22', 2, 401, false],
];

export const children: Child[] = childSeeds.map(([id, firstName, lastName, birthDate, level, bib, noMedicalConditions], i) => ({
  id,
  firstName,
  lastName,
  birthDate,
  level,
  bib,
  noMedicalConditions,
  programDay: 'Saturday',
  orderNumber: id === 'c-owen' ? 'KM-2025-118204' : `KM-2026-${(120300 + i * 17).toString()}`,
}));

export const persons: Person[] = [
  { id: 'p-melissa', name: 'Melissa Parr', phone: '416-555-0142', email: 'm.parr@example.test' },
  { id: 'p-daniel', name: 'Daniel Okafor', phone: '604-555-0187', email: 'd.okafor@example.test' },
  { id: 'p-claire', name: 'Claire Moreau', phone: '604-555-0110', email: 'claire.moreau@example.test' },
  { id: 'p-luc', name: 'Luc Moreau', phone: '604-555-0111', email: 'luc.moreau@example.test' },
  { id: 'p-jun', name: 'Jun Chen', phone: '604-555-0123', email: 'jun.chen@example.test' },
  { id: 'p-wei', name: 'Wei Chen', phone: '604-555-0124', email: 'wei.chen@example.test' },
  { id: 'p-raj', name: 'Raj Singh', phone: '778-555-0131', email: 'raj.singh@example.test' },
  { id: 'p-anita', name: 'Anita Singh', phone: '778-555-0132', email: 'anita.singh@example.test' },
  { id: 'p-grace-w', name: 'Grace Wong', phone: '604-555-0145', email: 'grace.wong@example.test' },
  { id: 'p-tom-w', name: 'Tom Wong', phone: '604-555-0146', email: 'tom.wong@example.test' },
  { id: 'p-sara-b', name: 'Sara Brown', phone: '604-555-0151', email: 'sara.brown@example.test' },
  { id: 'p-mike-b', name: 'Mike Brown', phone: '604-555-0152', email: 'mike.brown@example.test' },
  { id: 'p-elena-g', name: 'Elena Garcia', phone: '604-555-0161', email: 'elena.garcia@example.test' },
  { id: 'p-carlos-g', name: 'Carlos Garcia', phone: '604-555-0162', email: 'carlos.garcia@example.test' },
  { id: 'p-fatima-a', name: 'Fatima Ahmed', phone: '778-555-0171', email: 'fatima.ahmed@example.test' },
  { id: 'p-sean-m', name: 'Sean Murphy', phone: '604-555-0181', email: 'sean.murphy@example.test' },
  { id: 'p-kate-m', name: 'Kate Murphy', phone: '604-555-0182', email: 'kate.murphy@example.test' },
  { id: 'p-harp-k', name: 'Harpreet Kaur', phone: '778-555-0191', email: 'harpreet.kaur@example.test' },
  { id: 'p-dev-k', name: 'Dev Kaur', phone: '778-555-0192', email: 'dev.kaur@example.test' },
  { id: 'p-yan-l', name: 'Yan Li', phone: '604-555-0201', email: 'yan.li@example.test' },
  { id: 'p-hui-l', name: 'Hui Li', phone: '604-555-0202', email: 'hui.li@example.test' },
  { id: 'p-amy-t', name: 'Amy Thompson', phone: '604-555-0211', email: 'amy.thompson@example.test' },
  { id: 'p-greg-t', name: 'Greg Thompson', phone: '604-555-0212', email: 'greg.thompson@example.test' },
  { id: 'p-julie-d', name: 'Julie Dubois', phone: '604-555-0221', email: 'julie.dubois@example.test' },
  { id: 'p-marc-d', name: 'Marc Dubois', phone: '604-555-0222', email: 'marc.dubois@example.test' },
  { id: 'p-neha-p', name: 'Neha Patel', phone: '778-555-0231', email: 'neha.patel@example.test' },
  { id: 'p-lisa-w', name: 'Lisa Wilson', phone: '604-555-0241', email: 'lisa.wilson@example.test' },
  { id: 'p-dan-w', name: 'Dan Wilson', phone: '604-555-0242', email: 'dan.wilson@example.test' },
  { id: 'p-thu-n', name: 'Thu Nguyen', phone: '604-555-0251', email: 'thu.nguyen@example.test' },
];

let cpN = 0;
const link = (childId: string, personId: string, relationship: string, contactOrder: number | null, canPickUp: boolean): ChildPerson => ({
  id: `cp-${++cpN}`,
  childId,
  personId,
  relationship,
  contactOrder,
  canPickUp,
});

export const childPersons: ChildPerson[] = [
  link('c-owen', 'p-melissa', 'Mother', 1, true),
  link('c-owen', 'p-daniel', 'Father', 2, true),
  link('c-ava', 'p-claire', 'Mother', 1, true),
  link('c-ava', 'p-luc', 'Father', 2, true),
  link('c-lily', 'p-jun', 'Mother', 1, true),
  link('c-lily', 'p-wei', 'Father', 2, true),
  link('c-noah', 'p-raj', 'Father', 1, true),
  link('c-noah', 'p-anita', 'Mother', 2, true),
  link('c-chloe', 'p-grace-w', 'Mother', 1, true),
  link('c-chloe', 'p-tom-w', 'Father', 2, true),
  link('c-ethan', 'p-sara-b', 'Mother', 1, true),
  link('c-ethan', 'p-mike-b', 'Father', 2, true),
  link('c-mateo', 'p-elena-g', 'Mother', 1, true),
  link('c-mateo', 'p-carlos-g', 'Father', 2, true),
  link('c-zoe', 'p-fatima-a', 'Mother', 1, true),
  link('c-liam', 'p-sean-m', 'Father', 1, true),
  link('c-liam', 'p-kate-m', 'Mother', 2, true),
  link('c-isla', 'p-harp-k', 'Mother', 1, true),
  link('c-isla', 'p-dev-k', 'Father', 2, true),
  link('c-ben', 'p-yan-l', 'Mother', 1, true),
  link('c-ben', 'p-hui-l', 'Grandmother', 2, true),
  link('c-maya', 'p-amy-t', 'Mother', 1, true),
  link('c-maya', 'p-greg-t', 'Father', 2, true),
  link('c-lucas', 'p-julie-d', 'Mother', 1, true),
  link('c-lucas', 'p-marc-d', 'Father', 2, true),
  link('c-aria', 'p-neha-p', 'Mother', 1, true),
  link('c-jack', 'p-lisa-w', 'Mother', 1, true),
  link('c-jack', 'p-dan-w', 'Father', 2, true),
  link('c-emma', 'p-thu-n', 'Mother', 1, true),
];

export const parentAccounts: ParentAccount[] = [
  { userId: 'u-melissa', childId: 'c-owen' },
  { userId: 'u-jun', childId: 'c-lily' },
  { userId: 'u-claire', childId: 'c-ava' },
  { userId: 'u-fatima', childId: 'c-zoe' },
];

export const medical: MedicalAlert[] = [
  {
    id: 'm-owen',
    childId: 'c-owen',
    shortAlert: 'Mild asthma: blue inhaler in jacket pocket',
    details: 'Mild asthma, worse in cold air. Two puffs of the blue inhaler (salbutamol) if wheezing. Gets cold easily.',
    medicationLocation: 'Left jacket pocket',
    severity: 'medium',
  },
  {
    id: 'm-zoe',
    childId: 'c-zoe',
    shortAlert: 'Bee sting allergy: EpiPen in backpack',
    details: 'Anaphylaxis to bee stings (rare in winter). EpiPen Jr in the front pocket of her backpack.',
    medicationLocation: 'Backpack, front pocket',
    severity: 'high',
  },
  {
    id: 'm-maya',
    childId: 'c-maya',
    shortAlert: 'Celiac: no gluten at lunch',
    details: 'Celiac disease. Packs her own lunch; must not share food. Not life-threatening but makes her very ill.',
    medicationLocation: 'None',
    severity: 'medium',
  },
];
// Ava's tree nut allergy is deliberately NOT here: in the preview, her parent
// adds it and it shows up on the instructor's list straight away.

export const consents: ConsentForm[] = children
  .filter((c) => !['c-zoe', 'c-emma'].includes(c.id))
  .map((c) => ({ childId: c.id, signedBy: 'Parent', signedDate: '2026-11-20', photoConsent: c.id !== 'c-lily' }));

export const lessonDays: LessonDay[] = [
  { id: 'day-2026-12-12', date: '2026-12-12', programDay: 'Saturday' },
  { id: 'day-2026-12-19', date: '2026-12-19', programDay: 'Saturday' },
  { id: 'day-2027-01-09', date: '2027-01-09', programDay: 'Saturday' },
];

export const groups: Group[] = [
  { id: 'g-a', lessonDayId: TODAY_LESSON_DAY, name: 'Group A', level: 3, instructorId: 'u-sam' },
  { id: 'g-b', lessonDayId: TODAY_LESSON_DAY, name: 'Group B', level: 1, instructorId: 'u-priya' },
  { id: 'g-c', lessonDayId: TODAY_LESSON_DAY, name: 'Group C', level: 5, instructorId: 'u-jordan' },
];

export const groupMembers: GroupMember[] = [
  ...['c-owen', 'c-ava', 'c-noah', 'c-chloe', 'c-ethan'].map((childId) => ({ groupId: 'g-a', childId })),
  ...['c-lily', 'c-mateo', 'c-zoe', 'c-liam', 'c-isla', 'c-ben'].map((childId) => ({ groupId: 'g-b', childId })),
  ...['c-maya', 'c-lucas', 'c-aria', 'c-jack'].map((childId) => ({ groupId: 'g-c', childId })),
];

// Most children are already checked in this morning; a few are still to come.
const checkedIn: [child: string, time: string, jacket: string, pants: string, helmet: string][] = [
  ['c-ava', '08:34', 'Purple', 'Black', 'White'],
  ['c-noah', '08:36', 'Green', 'Grey', 'Black'],
  ['c-chloe', '08:41', 'Yellow', 'Navy', 'Pink'],
  ['c-ethan', '08:44', 'Blue', 'Black', 'Black'],
  ['c-lily', '08:38', 'Pink', 'Purple', 'Pink'],
  ['c-mateo', '08:47', 'Orange', 'Black', 'Blue'],
  ['c-zoe', '08:52', 'Teal', 'White', 'White'],
  ['c-liam', '08:55', 'Black', 'Red', 'Red'],
  ['c-maya', '08:31', 'White', 'Black', 'Grey'],
  ['c-lucas', '08:40', 'Navy', 'Grey', 'Black'],
  ['c-aria', '08:58', 'Red', 'Black', 'White'],
];

export const attendance: Attendance[] = checkedIn.map(([childId, time, jacket, pants, helmet]) => ({
  id: `a-${childId}`,
  childId,
  lessonDayId: TODAY_LESSON_DAY,
  checkInAt: at(time),
  checkedInBy: 'u-mei',
  jacket,
  pants,
  helmet,
  pickupAt: null,
  pickedUpBy: null,
  releasedBy: null,
}));

export const seedData: Data = {
  users,
  children,
  persons,
  childPersons,
  parentAccounts,
  medical,
  consents,
  lessonDays,
  groups,
  groupMembers,
  attendance,
  refusals: [],
  emergencies: [],
  acks: [],
  accessRecords: [],
};
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

export const LAST_ADULT = 'Each child needs at least one adult on file. Add another adult before removing this one.';
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
 * Saves the adults that changed: new ones are created and changed ones updated.
 * Only what changed is sent, so one parent's save can't undo what another parent
 * saved seconds earlier. Only adults named in `removedLinkIds` are deleted.
 * Returns null, saving nothing, if that would leave the child with no adults.
 */
export async function saveGuardians(childId: string, rows: GuardianRow[], removedLinkIds: string[]): Promise<GuardianRow[] | null> {
  const { person, childPerson } = await records();
  const existing = await listAll(childPerson, { childId });
  const existingById = new Map(existing.map((l) => [l.id, l]));
  const removing = new Set(removedLinkIds);
  const adding = rows.filter((r) => !existingById.has(r.linkId) && !PIEZAS_RECORD_ID.test(r.linkId)).length;
  if (existing.filter((l) => !removing.has(l.id)).length + adding === 0) return null;

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

### changed: lib/store.tsx

````
'use client';

// The app's working state. Saved in Peak Pals: adults linked to a child (through
// /api/guardians), and check-ins, pickups and the emergency log (through
// /api/today). Everything else is still preview-only: it lives in this browser
// tab's memory and resets on reload, until each piece is connected the same way.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  seedData,
  TODAY,
  TODAY_LESSON_DAY,
  type Attendance,
  type ChildPerson,
  type ConsentForm,
  type Data,
  type Emergency,
  type MedicalAlert,
  type PatrolAck,
  type Person,
  type PickupRefusal,
  type Role,
  type User,
} from './seed/data';

// Demo clock: starts at 1:35 p.m. on the first Saturday and runs in real time,
// so the police-call countdown has something sensible to count.
const CLOCK_START = new Date(`${TODAY}T13:35:00`).getTime();

let idN = 1000;
const newId = (prefix: string) => `${prefix}-${++idN}`;

type Store = {
  data: Data;
  me: User | null;
  now: Date;
  signIn: (userId: string) => void;
  signOut: () => void;
  // parent
  guardianLink: 'checking' | 'connected' | 'offline'; // is the app reaching Peak Pals for adults?
  sessionChecked: boolean; // false until we've looked up who is signed in
  liveLink: 'checking' | 'connected' | 'offline'; // is the app reaching Peak Pals for today's records?
  savePerson: (childId: string, person: Person, link: Omit<ChildPerson, 'id' | 'childId' | 'personId'>, linkId?: string) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  saveMedical: (alert: Omit<MedicalAlert, 'id'>, id?: string) => void;
  removeMedical: (id: string) => void;
  setNoMedical: (childId: string, value: boolean) => void;
  signConsent: (form: ConsentForm) => void;
  // instructor
  logAccess: (what: string, childId: string) => void;
  fixClothing: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => Promise<void>;
  // desk
  checkIn: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => Promise<void>;
  release: (childId: string, personId: string) => Promise<void>;
  refusePickup: (childId: string, nameGiven: string) => Promise<void>;
  // missing child
  reportMissing: (childId: string, lastSeenPlace: string, lastSeenTime: string) => Promise<void>;
  acknowledge: (emergencyId: string) => Promise<void>;
  shareWithPolice: (emergencyId: string) => Promise<void>;
  markNoticeMailed: (emergencyId: string) => Promise<void>;
  closeSearch: (emergencyId: string, outcome: string) => Promise<void>;
  // admin
  updateChild: (childId: string, patch: Partial<Data['children'][number]>) => void;
  addGroup: (name: string, level: number, instructorId: string) => void;
  moveChild: (childId: string, groupId: string | null) => void;
  importRows: (rows: ImportRow[]) => { added: number; updated: number };
};

export type ImportRow = { orderNumber: string; firstName: string; lastName: string; birthDate: string; level: number; programDay: 'Saturday' | 'Sunday' };

/**
 * Keeps a child's emergency contacts numbered 1, 2, 3... with no gaps.
 * If `movedId` takes a position someone already holds, that person and
 * everyone after them shift down one; nobody loses their place on the list.
 */
function renumberContacts(rows: ChildPerson[], childId: string, movedId?: string, position?: number | null): ChildPerson[] {
  const ordered = rows
    .filter((cp) => cp.childId === childId && cp.contactOrder !== null && cp.id !== movedId)
    .sort((a, b) => (a.contactOrder ?? 0) - (b.contactOrder ?? 0))
    .map((cp) => cp.id);
  if (movedId && position) ordered.splice(position - 1, 0, movedId);
  return rows.map((cp) => {
    if (cp.childId !== childId) return cp;
    const i = ordered.indexOf(cp.id);
    return { ...cp, contactOrder: i >= 0 ? i + 1 : null };
  });
}

// What the server sends back for each saved adult (see lib/server/guardians.ts).
type GuardianRow = {
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

/** Replaces the listed children's adults with what Peak Pals has saved. */
function applyGuardians(d: Data, rows: GuardianRow[], childIds: Set<string>): Data {
  const incoming = new Map(rows.map((r) => [r.personId, { id: r.personId, name: r.name, phone: r.phone, email: r.email }]));
  return {
    ...d,
    persons: [...d.persons.filter((p) => !incoming.has(p.id)), ...incoming.values()],
    childPersons: [
      ...d.childPersons.filter((cp) => !childIds.has(cp.childId)),
      ...rows.map((r) => ({ id: r.linkId, childId: r.childId, personId: r.personId, relationship: r.relationship, contactOrder: r.contactOrder, canPickUp: r.canPickUp })),
    ],
  };
}

// What the server sends back for today (see lib/server/today.ts).
type TodayRows = { attendance: Attendance[]; refusals: PickupRefusal[]; emergencies: Emergency[]; acks: PatrolAck[] };

/** Puts today's saved records in place. A saved check-in replaces the made-up one. */
function applyToday(d: Data, t: TodayRows): Data {
  const saved = new Set(t.attendance.map((a) => a.childId));
  return {
    ...d,
    attendance: [...d.attendance.filter((a) => !(a.lessonDayId === TODAY_LESSON_DAY && saved.has(a.childId))), ...t.attendance],
    refusals: t.refusals,
    emergencies: t.emergencies,
    acks: t.acks,
  };
}

const PIEZAS_RECORD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One child's adults, in the shape the server saves. */
function guardianRows(d: Data, childId: string) {
  return d.childPersons
    .filter((cp) => cp.childId === childId)
    .map((cp) => {
      const p = d.persons.find((x) => x.id === cp.personId);
      return { linkId: cp.id, name: p?.name ?? '', phone: p?.phone ?? '', email: p?.email ?? '', relationship: cp.relationship, contactOrder: cp.contactOrder, canPickUp: cp.canPickUp };
    });
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seedData);
  const [meId, setMeId] = useState<string | null>(null);
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => new Date(CLOCK_START));
  const [guardianLink, setGuardianLink] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [liveLink, setLiveLink] = useState<'checking' | 'connected' | 'offline'>('checking');
  // Counts saves, so a background refresh that started before a save can't overwrite it.
  const saves = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date(CLOCK_START + (Date.now() - started))), 1000);
    return () => clearInterval(t);
  }, [started]);

  // Remember who is signed in across page changes within this tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('kk-preview-user');
      if (saved) setMeId(saved);
    } catch {
      /* storage unavailable: stay signed out */
    }
    setSessionChecked(true);
  }, []);

  const me = data.users.find((u) => u.id === meId) ?? null;
  // Local wall-clock time (no time zone suffix), matching how the seed times are written.
  const stamp = useCallback(() => {
    const d = new Date(CLOCK_START + (Date.now() - started));
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }, [started]);
  const update = useCallback((fn: (d: Data) => Data) => setData((d) => fn(d)), []);
  const openSearches = data.emergencies.filter((e) => e.status === 'open').map((e) => e.id).join();

  // Adults come from Peak Pals: loaded on sign-in, then re-checked every 10
  // seconds so a change made on another device shows up here.
  useEffect(() => {
    if (!meId) return;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/guardians?as=${encodeURIComponent(meId)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const { guardians } = (await res.json()) as { guardians: GuardianRow[] };
        if (stopped) return;
        setData((d) => applyGuardians(d, guardians, new Set(guardians.map((g) => g.childId))));
        setGuardianLink('connected');
      } catch {
        if (!stopped) setGuardianLink('offline');
      }
    };
    void load();
    const t = setInterval(load, 10_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
    // A search opening or closing changes which adults patrol may see, so re-check at once.
  }, [meId, openSearches]);

  // Today's records come from Peak Pals: staff re-check every 5 seconds so a
  // missing-child alert reaches patrol quickly; parents less often.
  const staff = data.users.find((u) => u.id === meId)?.role !== 'parent';
  useEffect(() => {
    if (!meId) return;
    let stopped = false;
    const load = async () => {
      const startedAt = saves.current;
      try {
        const res = await fetch(`/api/today?as=${encodeURIComponent(meId)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const { today } = (await res.json()) as { today: TodayRows };
        if (stopped || saves.current !== startedAt) return;
        setData((d) => applyToday(d, today));
        setLiveLink('connected');
      } catch {
        if (!stopped) setLiveLink('offline');
      }
    };
    void load();
    const t = setInterval(load, staff ? 5_000 : 30_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [meId, staff]);

  /** Sends one action to Peak Pals. The screen only changes once it's saved. */
  const sendToday = useCallback(async (asUserId: string, action: Record<string, unknown>) => {
    saves.current += 1;
    try {
      let res: Response;
      try {
        res = await fetch('/api/today', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ as: asUserId, ...action }) });
      } catch {
        setLiveLink('offline');
        throw new Error('Couldn’t reach Peak Pals, so that was not saved.');
      }
      const body = (await res.json().catch(() => ({}))) as { today?: TodayRows; error?: string };
      if (!res.ok || !body.today) throw new Error(body.error ?? 'That didn’t save. Please try again.');
      const saved = body.today;
      setData((d) => applyToday(d, saved));
      setLiveLink('connected');
    } finally {
      saves.current += 1;
    }
  }, []);

  /** Sends only the adults that changed, so this save can't undo another parent's. */
  const pushGuardians = useCallback(async (before: Data, next: Data, childId: string, asUserId: string, removedLinkIds: string[] = []) => {
    const previous = new Map(guardianRows(before, childId).map((r) => [r.linkId, JSON.stringify(r)]));
    // Adults still only on the made-up list have to go up too, or they'd vanish.
    const guardians = guardianRows(next, childId).filter((r) => !PIEZAS_RECORD_ID.test(r.linkId) || previous.get(r.linkId) !== JSON.stringify(r));
    const res = await fetch('/api/guardians', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ as: asUserId, childId, guardians, removedLinkIds }),
    });
    if (res.status === 404) throw new Error('Saving is only switched on for local testing until real sign-in is ready.');
    const body = (await res.json().catch(() => ({}))) as { guardians?: GuardianRow[]; error?: string };
    if (!res.ok || !body.guardians) throw new Error(body.error ?? 'That didn’t save. Please try again.');
    const saved = body.guardians;
    setData((d) => applyGuardians(d, saved, new Set([childId])));
    setGuardianLink('connected');
  }, []);

  const store = useMemo<Store>(() => {
    const userId = me?.id ?? '';
    const role = (me?.role ?? 'parent') as Role;
    const record = (d: Data, what: string, childId: string): Data => ({
      ...d,
      accessRecords: [{ id: newId('ar'), userId, role, what, childId, at: stamp() }, ...d.accessRecords],
    });

    return {
      data,
      me,
      now,
      signIn: (id) => {
        setMeId(id);
        try {
          sessionStorage.setItem('kk-preview-user', id);
        } catch {
          /* ignore */
        }
      },
      signOut: () => {
        setMeId(null);
        try {
          sessionStorage.removeItem('kk-preview-user');
        } catch {
          /* ignore */
        }
      },
      guardianLink,
      sessionChecked,
      liveLink,
      savePerson: async (childId, person, link, linkId) => {
        const persons = data.persons.some((p) => p.id === person.id)
          ? data.persons.map((p) => (p.id === person.id ? person : p))
          : [...data.persons, person];
        const rowId = linkId ?? newId('cp');
        const row: ChildPerson = { id: rowId, childId, personId: person.id, ...link };
        const links = linkId ? data.childPersons.map((cp) => (cp.id === linkId ? row : cp)) : [...data.childPersons, row];
        await pushGuardians(data, { ...data, persons, childPersons: renumberContacts(links, childId, rowId, link.contactOrder) }, childId, userId);
      },
      removeLink: async (linkId) => {
        const childId = data.childPersons.find((cp) => cp.id === linkId)?.childId;
        if (!childId) return;
        const rest = data.childPersons.filter((cp) => cp.id !== linkId);
        await pushGuardians(data, { ...data, childPersons: renumberContacts(rest, childId) }, childId, userId, [linkId]);
      },
      saveMedical: (alert, id) =>
        update((d) => ({
          ...d,
          children: d.children.map((c) => (c.id === alert.childId ? { ...c, noMedicalConditions: false } : c)),
          medical: id ? d.medical.map((m) => (m.id === id ? { ...alert, id } : m)) : [...d.medical, { ...alert, id: newId('m') }],
        })),
      removeMedical: (id) => update((d) => ({ ...d, medical: d.medical.filter((m) => m.id !== id) })),
      setNoMedical: (childId, value) =>
        update((d) => ({ ...d, children: d.children.map((c) => (c.id === childId ? { ...c, noMedicalConditions: value } : c)) })),
      signConsent: (form) => update((d) => ({ ...d, consents: [...d.consents.filter((c) => c.childId !== form.childId), form] })),
      logAccess: (what, childId) => update((d) => record(d, what, childId)),
      fixClothing: (childId, clothing) => sendToday(userId, { action: 'fixClothing', childId, ...clothing, at: stamp() }),
      checkIn: (childId, clothing) => sendToday(userId, { action: 'checkIn', childId, ...clothing, at: stamp() }),
      release: (childId, personId) => sendToday(userId, { action: 'release', childId, personId, at: stamp() }),
      refusePickup: (childId, nameGiven) => sendToday(userId, { action: 'refusePickup', childId, nameGiven, at: stamp() }),
      reportMissing: (childId, lastSeenPlace, lastSeenTime) => sendToday(userId, { action: 'reportMissing', childId, lastSeenPlace, lastSeenTime, at: stamp() }),
      acknowledge: (emergencyId) => sendToday(userId, { action: 'acknowledge', emergencyId, at: stamp() }),
      shareWithPolice: async (emergencyId) => {
        await sendToday(userId, { action: 'shareWithPolice', emergencyId, at: stamp() });
        const childId = data.emergencies.find((e) => e.id === emergencyId)?.childId;
        if (childId) update((d) => record(d, 'Shared details with police', childId));
      },
      markNoticeMailed: (emergencyId) => sendToday(userId, { action: 'markNoticeMailed', emergencyId, at: stamp() }),
      closeSearch: (emergencyId, outcome) => sendToday(userId, { action: 'closeSearch', emergencyId, outcome, at: stamp() }),
      updateChild: (childId, patch) =>
        update((d) => ({ ...d, children: d.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)) })),
      addGroup: (name, level, instructorId) =>
        update((d) => ({ ...d, groups: [...d.groups, { id: newId('g'), lessonDayId: TODAY_LESSON_DAY, name, level, instructorId }] })),
      moveChild: (childId, groupId) =>
        update((d) => {
          const todayGroupIds = new Set(d.groups.filter((g) => g.lessonDayId === TODAY_LESSON_DAY).map((g) => g.id));
          const rest = d.groupMembers.filter((m) => !(m.childId === childId && todayGroupIds.has(m.groupId)));
          return { ...d, groupMembers: groupId ? [...rest, { groupId, childId }] : rest };
        }),
      importRows: (rows) => {
        // Matched on the store's order number: existing children are updated, never duplicated.
        const known = new Set(data.children.map((c) => c.orderNumber));
        const updated = rows.filter((r) => known.has(r.orderNumber)).length;
        update((d) => {
          let kids = [...d.children];
          for (const r of rows) {
            const i = kids.findIndex((c) => c.orderNumber === r.orderNumber);
            if (i >= 0) kids[i] = { ...kids[i], ...r };
            else kids = [...kids, { id: newId('c'), ...r, bib: 500 + kids.length, noMedicalConditions: false }];
          }
          return { ...d, children: kids };
        });
        return { added: rows.length - updated, updated };
      },
    };
  }, [data, me, now, stamp, update, guardianLink, sessionChecked, liveLink, pushGuardians, sendToday]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
````

### changed: package.json

````
{
  "name": "sfu_venture_labs_2026",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "data:guardians": "node --env-file=.env scripts/show-guardians.mjs",
    "data:today": "node --env-file=.env scripts/today.mjs",
    "data:reset-today": "node --env-file=.env scripts/today.mjs reset"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@types/node": "^20.17.6",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.6",
    "piezas": "^0.7.7",
    "typescript": "^5.6.3"
  },
  "dependencies": {
    "@piezas/sdk": "^0.5.2",
    "next": "^15.3.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
````

### changed: scripts/show-guardians.mjs

````
// Prints the adults saved in this project's Piezas app, straight from Piezas.
// Run with:  npm run data:guardians
import { Piezas } from '@piezas/sdk';

const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY });

// Keep these fields in step with lib/server/guardians.ts.
const { kk_person: person, kk_child_person: childPerson } = await piezas.defineEntities(
  {
    kk_person: {
      fields: { name: { type: 'text', required: true }, phone: { type: 'phone', required: true }, email: { type: 'email' } },
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
  },
  { onDrift: 'ignore' },
);

async function listAll(entity) {
  const all = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

const [links, people] = await Promise.all([listAll(childPerson), listAll(person)]);
const byId = new Map(people.map((p) => [p.id, p]));

console.log(`\nSaved in Piezas: ${people.length} people, ${links.length} links to children\n`);
if (links.length) {
  console.table(
    links.map((l) => ({
      child: l.data.childId,
      adult: byId.get(l.data.personId)?.data.name ?? '(missing)',
      relationship: l.data.relationship,
      phone: byId.get(l.data.personId)?.data.phone ?? '',
      'contact #': l.data.contactOrder ?? '',
      'can pick up': l.data.canPickUp,
      saved: l.updatedAt,
    })),
  );
}
````

### changed: tests/scenarios/S-001-each-person-only-sees-their-own-role-s-screens.spec.ts

````
// piezas-scenario: S-001 v=3b63b7142450
// S-001: Each person only sees their own role's screens
//   Given an instructor account created by the administrator
//   When the instructor signs in and tries to open the desk check-in screen
//   Then they are shown their own group screen instead, and the desk screen is not available to them
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-001: Each person only sees their own role's screens", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-001 has no test yet");
});
````

### changed: tests/scenarios/S-002-a-parent-sets-up-their-account-from-the-welcome.spec.ts

````
// piezas-scenario: S-002 v=c6874b1b377b
// S-002: A parent sets up their account from the welcome email
//   Given a parent whose child was added from the store spreadsheet
//   When they open the welcome email link, set a password, sign in, and enter the emailed 6-digit code
//   Then they arrive at their child's page
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-002: A parent sets up their account from the welcome email", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-002 has no test yet");
});
````

### changed: tests/scenarios/S-003-a-parent-only-sees-their-own-children.spec.ts

````
// piezas-scenario: S-003 v=2f2efafb32ec
// S-003: A parent only sees their own children
//   Given two families each with one child
//   When the first parent signs in
//   Then only their own child is listed, and opening the other child's page shows "not found"
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-003: A parent only sees their own children", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-003 has no test yet");
});
````

### changed: tests/scenarios/S-004-a-grandparent-with-a-different-last-name-can-pic.spec.ts

````
// piezas-scenario: S-004 v=8ccbbe7bfa85
// S-004: A grandparent with a different last name can pick up
//   Given Owen Okafor-Parr, whose mother is his only approved adult
//   When his mother adds "Grace Okafor (grandmother)" as allowed to pick up
//   Then the desk pickup screen for Owen immediately shows Grace as approved, and the desk can release Owen to her and record it
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-004: A grandparent with a different last name can pick up", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-004 has no test yet");
});
````

### changed: tests/scenarios/S-005-a-parent-s-allergy-reaches-the-instructor.spec.ts

````
// piezas-scenario: S-005 v=d059a0e8073c
// S-005: A parent's allergy reaches the instructor
//   Given Ava is in Sam's group today
//   When Ava's parent adds the alert "Tree nut allergy, EpiPen in backpack"
//   Then Sam's group list shows that alert next to Ava without any taps
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-005: A parent's allergy reaches the instructor", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-005 has no test yet");
});
````

### changed: tests/scenarios/S-006-a-parent-signs-the-consent-form-in-the-portal.spec.ts

````
// piezas-scenario: S-006 v=e20d62a06cef
// S-006: A parent signs the consent form in the portal
//   Given a child with no consent form
//   When the parent completes and signs the consent form, choosing no photo consent
//   Then the child no longer appears as "no consent form" for the administrator, and no photo is shown for the child anywhere
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-006: A parent signs the consent form in the portal", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-006 has no test yet");
});
````

### changed: tests/scenarios/S-007-an-incomplete-phone-number-is-refused.spec.ts

````
// piezas-scenario: S-007 v=e8d0a3d7cf75
// S-007: An incomplete phone number is refused
//   Given a parent adding an emergency contact
//   When they enter the phone number "604555-187"
//   Then the form says the number is incomplete and does not save
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-007: An incomplete phone number is refused", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-007 has no test yet");
});
````

### changed: tests/scenarios/S-008-a-parent-sees-who-picked-up-their-child.spec.ts

````
// piezas-scenario: S-008 v=d9d4097f8311
// S-008: A parent sees who picked up their child
//   Given Lily was checked in and picked up by her mother today
//   When Lily's parent opens her page
//   Then they see her group, today's check-in time, pickup time, and "picked up by" her mother
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-008: A parent sees who picked up their child", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-008 has no test yet");
});
````

### changed: tests/scenarios/S-009-an-instructor-only-sees-their-own-group.spec.ts

````
// piezas-scenario: S-009 v=cff0d25fc47f
// S-009: An instructor only sees their own group
//   Given Sam teaches a level 3 group of five children today
//   When Sam signs in on a phone
//   Then exactly those five children are listed in large rows, and children from other groups cannot be opened
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-009: An instructor only sees their own group", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-009 has no test yet");
});
````

### changed: tests/scenarios/S-010-opening-medical-details-is-recorded.spec.ts

````
// piezas-scenario: S-010 v=2d7fece43967
// S-010: Opening medical details is recorded
//   Given Sam's group list shows Ava's allergy alert
//   When Sam taps the alert
//   Then the full medical details appear, and the administrator's access record shows Sam viewed Ava's medical details at that time
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-010: Opening medical details is recorded", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-010 has no test yet");
});
````

### changed: tests/scenarios/S-011-desk-checks-in-a-child-with-today-s-clothing.spec.ts

````
// piezas-scenario: S-011 v=94c0c5aa5b3e
// S-011: Desk checks in a child with today's clothing
//   Given Owen is registered for today and not yet checked in
//   When the desk searches "Owen", checks him in, and enters jacket "red", pants "black" and helmet "white"
//   Then Owen shows as checked in, with the time, the staff member's name, and his clothing colours
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-011: Desk checks in a child with today's clothing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-011 has no test yet");
});
````

### changed: tests/scenarios/S-012-an-unapproved-adult-is-stopped-at-pickup.spec.ts

````
// piezas-scenario: S-012 v=0a4c14a80098
// S-012: An unapproved adult is stopped at pickup
//   Given Lily's approved adults are her mother and father only
//   When a man saying he is her uncle asks to pick her up
//   Then the desk sees a warning that he is not approved, Lily stays checked in, and the refused attempt is recorded with the time and staff member
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-012: An unapproved adult is stopped at pickup", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-012 has no test yet");
});
````

### changed: tests/scenarios/S-013-the-desk-cannot-see-medical-details.spec.ts

````
// piezas-scenario: S-013 v=d88d80b36e11
// S-013: The desk cannot see medical details
//   Given Ava has a tree nut allergy on file
//   When the desk opens Ava's pickup screen
//   Then no medical alert or medical detail is shown
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-013: The desk cannot see medical details", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-013 has no test yet");
});
````

### changed: tests/scenarios/S-014-reporting-a-missing-child-alerts-patrol-in-one-s.spec.ts

````
// piezas-scenario: S-014 v=6dff2440cca7
// S-014: Reporting a missing child alerts patrol in one step
//   Given Owen is checked in and in Sam's group
//   When Sam reports Owen missing, last seen at the top of the Pigeon chair at 1:40 p.m.
//   Then every patroller sees a new search alert for Owen right away
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-014: Reporting a missing child alerts patrol in one step", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-014 has no test yet");
});
````

### changed: tests/scenarios/S-015-patrol-sees-everything-on-one-screen-during-a-se.spec.ts

````
// piezas-scenario: S-015 v=5355daa7c901
// S-015: Patrol sees everything on one screen during a search
//   Given an open search for Owen
//   When a patroller opens the search and acknowledges it
//   Then one screen shows Owen's jacket, pants and helmet colour, medical alerts, all emergency contacts with phone numbers, approved adults, group, instructor, and last seen place and time, and the patroller is listed as acknowledged
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-015: Patrol sees everything on one screen during a search", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-015 has no test yet");
});
````

### changed: tests/scenarios/S-016-patrol-access-ends-when-the-search-closes.spec.ts

````
// piezas-scenario: S-016 v=859bb42da75a
// S-016: Patrol access ends when the search closes
//   Given an open search for Owen that patrol can see
//   When the search is closed as "found safe"
//   Then the closing time and outcome are saved, and patrol can no longer open Owen's details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-016: Patrol access ends when the search closes", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-016 has no test yet");
});
````

### changed: tests/scenarios/S-017-the-search-shows-when-police-must-be-called.spec.ts

````
// piezas-scenario: S-017 v=a41bcb6f309d
// S-017: The search shows when police must be called
//   Given Owen was last seen at 1:40 p.m.
//   When patrol opens the search at 2:00 p.m.
//   Then the screen shows 40 minutes left before police must be called at 2:40 p.m.
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-017: The search shows when police must be called", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-017 has no test yet");
});
````

### changed: tests/scenarios/S-018-sharing-with-police-leaves-a-reminder-to-notify.spec.ts

````
// piezas-scenario: S-018 v=4c04533b737c
// S-018: Sharing with police leaves a reminder to notify the family
//   Given an open search for Owen
//   When patrol records that Owen's details were shared with police
//   Then the time is saved, and the search shows "Mail a notice to the family" until it is marked done
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-018: Sharing with police leaves a reminder to notify the family", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-018 has no test yet");
});
````

### changed: tests/scenarios/S-019-the-administrator-sees-whose-information-is-miss.spec.ts

````
// piezas-scenario: S-019 v=f968617bbca5
// S-019: The administrator sees whose information is missing
//   Given one child with no consent form and another with only one emergency contact
//   When the administrator opens the missing information list
//   Then both children are listed with what each is missing
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-019: The administrator sees whose information is missing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-019 has no test yet");
});
````

### changed: tests/scenarios/S-020-the-administrator-builds-groups-for-a-lesson-day.spec.ts

````
// piezas-scenario: S-020 v=777e24b06a42
// S-020: The administrator builds groups for a lesson day
//   Given a lesson day with no groups
//   When the administrator creates a level 3 group with Sam as instructor and adds six children
//   Then the group shows six children, and adding a seventh is refused
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-020: The administrator builds groups for a lesson day", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-020 has no test yet");
});
````

### changed: tests/scenarios/S-021-the-administrator-corrects-a-child-s-record.spec.ts

````
// piezas-scenario: S-021 v=448b1151e978
// S-021: The administrator corrects a child's record
//   Given Owen's level is 3
//   When the administrator changes it to 4
//   Then Owen shows as level 4 everywhere
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-021: The administrator corrects a child's record", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-021 has no test yet");
});
````

### changed: tests/scenarios/S-022-the-store-spreadsheet-adds-and-updates-children.spec.ts

````
// piezas-scenario: S-022 v=9d85355a66f0
// S-022: The store spreadsheet adds and updates children
//   Given Owen is already in the portal with order number KM-2025-118204
//   When the administrator uploads a spreadsheet with Owen's row (level changed to 4) and one new child
//   Then Owen is updated rather than duplicated, and the new child is added
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-022: The store spreadsheet adds and updates children", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-022 has no test yet");
});
````

### changed: tests/scenarios/S-023-an-instructor-s-group-still-shows-with-no-wifi.spec.ts

````
// piezas-scenario: S-023 v=9e925cf1cf1b
// S-023: An instructor's group still shows with no wifi
//   Given Sam has saved today's group to his phone, including Ava's alert "Tree nut allergy, EpiPen in backpack"
//   When his phone loses its connection and he opens his group
//   Then he sees his five children with bibs, clothing and Ava's alert, and no full medical details or contacts
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-023: An instructor's group still shows with no wifi", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-023 has no test yet");
});
````

### changed: tests/scenarios/S-024-the-administrator-sees-today-s-check-in-clothing.spec.ts

````
// piezas-scenario: S-024 v=f74e86eb886a
// S-024: The administrator sees today's check-in clothing
//   Given the desk checked Owen in wearing a red jacket, black pants and a white helmet
//   When the administrator opens the list of children
//   Then Owen's row shows his check-in time, who checked him in, and "red" jacket, "black" pants and "white" helmet
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-024: The administrator sees today's check-in clothing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-024 has no test yet");
});
````

### changed: tests/scenarios/S-025-a-parent-can-list-as-many-emergency-contacts-as.spec.ts

````
// piezas-scenario: S-025 v=6b0a38627c42
// S-025: A parent can list as many emergency contacts as they need
//   Given Owen already has a 1st and a 2nd emergency contact
//   When his mother adds Grace Okafor and chooses "3rd emergency contact", then adds another adult and chooses "4th emergency contact"
//   Then Owen shows four emergency contacts in that order, and patrol's search screen lists all four
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-025: A parent can list as many emergency contacts as they need", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-025 has no test yet");
});
````

### changed: tests/scenarios/S-026-the-desk-can-tap-a-colour-or-type-one.spec.ts

````
// piezas-scenario: S-026 v=c9b0f03c105e
// S-026: The desk can tap a colour or type one
//   Given Owen is not yet checked in
//   When the desk taps "Red" for jacket and "Black" for pants, and types "camo" for helmet, then checks him in
//   Then Owen shows as checked in with a Red jacket, Black pants and a camo helmet
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-026: The desk can tap a colour or type one", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-026 has no test yet");
});
````

### changed: tests/scenarios/S-027-an-instructor-corrects-a-child-s-clothing.spec.ts

````
// piezas-scenario: S-027 v=4dec64e27766
// S-027: An instructor corrects a child's clothing
//   Given Ava is in Sam's group, checked in with a Purple jacket, and a search for her is open
//   When Sam changes her jacket to Green and saves
//   Then Sam's list shows a Green jacket with his name and the time of the correction, patrol's search screen shows Green, and Sam has no way to correct a child in another group
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-027: An instructor corrects a child's clothing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-027 has no test yet");
});
````
