# Kestrel Kids Portal: screen list for the front end

Every screen the portal needs, grouped by role. Built from [SPEC.md](../SPEC.md) (requirement numbers in brackets, e.g. R-015) and the team's permissions table.

**Status key**
- **Built**: exists in the clickable preview with made-up data. Needs polish, then hooking up to real data.
- **Partly built**: exists but is missing pieces listed in the row.
- **Not built**: needed and not started.

**Ground rules for every screen**
- Each screen checks the signed-in person's role. Anyone with another role is sent to their own home screen (R-001). The real check also happens on the server; the screen check is for convenience only.
- Phone-first. Instructor screens must work in gloves: touch targets at least 44px, main actions 56px (R-014).
- Put a `data-testid` on anything a test needs to click or read. The automated checks select by it.
- The "Report a problem" button appears bottom-left on every screen, including sign-in (added in the build step).
- Shared code: page frame `components/Shell.tsx`, who-sees-what rules `lib/access.ts`, made-up data `lib/seed/data.ts`, styles `app/globals.css`.

---

## 1. Sign-in (everyone)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 1.1 | Sign in | `/` | Built | Email and password, then "Continue" (R-002). Wrong details: "That email and password don't match an account." The preview also has "Try the preview as…" buttons, which are removed in the real build. |
| 1.2 | Enter emailed code | `/` (step 2) | Built | 6-digit code emailed at every sign-in. Wrong code message, "Back" link. Needs a "Send a new code" link (not built). |
| 1.3 | Set up your account (welcome link) | `/welcome?token=…` | Not built | Parents arrive from the welcome email. Shows the parent's email, then "Choose a password" and "Confirm password", then sends them to 1.2. Expired-link state: "This link has expired. Ask the snow school for a new one." |
| 1.4 | Forgot password | `/forgot-password` | Not built | Email field, then "If that email has an account, we've sent a reset link." The message is the same either way, so it doesn't reveal who has an account. |
| 1.5 | Reset password | `/reset-password?token=…` | Not built | New password plus confirm, then back to sign-in. Expired-link state. |
| 1.6 | Not found / no access | any | Partly built | Exists only for parents opening another family's child. Needs one shared "Not found" page. |

## 2. Parent (phone first)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 2.1 | Your children | `/parent` | Built | One card per child: name, age, level, day, group. A "1 to finish" chip with the list of what's missing (R-004, R-027). |
| 2.2 | Child: Lessons | `/parent/[childId]` (tab) | Built | Today's group and instructor, check-in time, pickup time and who picked them up, the season's lesson dates (R-010). |
| 2.3 | Child: Contacts & pickup | same, tab | Built | List of adults: relationship, phone, email, "Emergency contact 1/2" chip, "Can pick up" chip. Edit and Remove on each (R-005). |
| 2.4 | Add or edit an adult | same, form | Built | Name, relationship, phone (checked: must be 10 digits, R-009), email (optional), emergency contact (none, 1st or 2nd), "Allowed to pick up" checkbox. Choosing 1st or 2nd moves that label off whoever had it. |
| 2.5 | Child: Medical | same, tab | Built | Each alert shows the short alert line coloured by severity, the details and the medication location. A "no allergies or conditions" checkbox when there are none (R-006). |
| 2.6 | Add or edit an alert | same, form | Built | Short alert (one line for the instructor), details, where medication is kept, how serious (life-threatening, needs attention, good to know). |
| 2.7 | Child: Consent form | same, tab | Built | Consent text, optional photo consent, "I agree", type full name to sign. After signing: a read-only summary (R-008). |
| 2.8 | Upload child photo | same, Consent tab | Not built | Only shown when photo consent is ticked. Photo upload and preview, with a remove option. Patrol sees it during a search (R-021). |
| 2.9 | Account & security | `/parent/account` | Not built | Change password, change email. |

## 3. Instructor (phone, outdoors, gloves)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 3.1 | My group today | `/instructor` | Built | Group name and level, then one large row per child: name, age, bib, today's jacket/pants/helmet, and a status chip (Here, Not checked in, Gone home, Missing). Alerts show in full on the row with no tap needed (R-011, R-012). |
| 3.2 | Medical details | `/instructor` (sheet) | Built | Opens from tapping an alert: full details and medication. Says "This view was recorded" (R-013). |
| 3.3 | Report missing | sheet, shared with desk and admin | Built | "Where were they last seen?", time (defaults to now), red "Alert ski patrol now" button, then a confirmation: "Ski patrol has been alerted." (R-019). |
| 3.4 | Save for offline | `/instructor` (card) | Built | "Save for offline" button. Once saved: the time it was saved, "Update saved copy", "View offline copy", "Delete" (R-032). |
| 3.5 | Offline copy | `/instructor` (no connection) | Partly built | Read-only group list with a warning: "No connection. Showing your offline copy (saved 1:35 p.m.)." Real build: the page must also load from scratch with no wifi (offline web app), not just while it's already open. |
| 3.6 | No group today | `/instructor` | Built | "You aren't teaching a group today." |

## 4. Desk / receptionist (laptop or tablet at the counter)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 4.1 | Check-in and pickup | `/desk` | Built | Counts at top ("11 of 16 checked in", "0 gone home"). Search by name or bib on the left, child panel on the right. **Never shows medical information** (R-015, R-018). |
| 4.2 | Check in | `/desk` (panel) | Built | Jacket, pants and helmet colour (all required), then "Check in". Afterwards: "Checked in at 8:38 a.m. by Mei Tanaka · Pink jacket, Purple pants, Pink helmet." |
| 4.3 | Pickup | `/desk` (panel) | Built | One big "Release to <name> (<relationship>)" button per approved adult, with phone. "Ask for photo ID" hint. Afterwards: who took them and who released them (R-016). |
| 4.4 | Someone else is here | `/desk` (panel) | Built | "Name the adult gave", then "Check". Shows a red warning ("…is NOT on Lily's pickup list. Do not release…") and records the attempt (R-017). |
| 4.5 | Pickups refused today | `/desk` (bottom) | Built | Table: time, child, adult who asked, staff member. |
| 4.6 | Report missing | sheet | Built | Same as 3.3. |
| 4.7 | Fix clothing after check-in | `/desk` (panel) | Not built | An "Edit clothing" link for when a child changes jackets at lunch. Matters for patrol. |

## 5. Patrol (tablet in the patrol hut, also phones)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 5.1 | No open searches | `/patrol` | Built | Explains that details appear only during a search (R-022). |
| 5.2 | New search alert | any patrol screen | Partly built | Red "MISSING CHILD" banner. Real build needs the alert to reach every patroller immediately (sound, notification, and/or text) even when the screen isn't open (R-020). |
| 5.3 | Search screen (one screen) | `/patrol` | Built | Photo (or "No photo consent"), jacket/pants/helmet, level, bib, last seen place and time, who reported it, group and instructor, medical alerts with details, emergency contacts as tap-to-call links, other pickup adults (R-021). |
| 5.4 | Police countdown | `/patrol` (card) | Built | "Call police by 2:36 p.m." with a large "40 min left", which turns red under 10 minutes. 60 minutes after last seen or 4 p.m., whichever comes first (R-024). |
| 5.5 | Shared with police + family notice | `/patrol` (card) | Built | "Record: details shared with police", then the time, then a to-do: "Mail a notice to the family", with "Mark done" (R-025). |
| 5.6 | Acknowledge | `/patrol` (card) | Built | "I'm on it" button, and the list of who has acknowledged and when (R-023). |
| 5.7 | Close search | `/patrol` (card) | Built | Outcome (Found safe, Found and needed first aid, Handed over to police, False alarm), then close. Details disappear for patrol (R-026, R-022). |
| 5.8 | Closed searches today | `/patrol` (bottom) | Built | Child's first name and last initial only, closing time, outcome, notice status with "mark done". |
| 5.9 | More than one open search | `/patrol` (top) | Built | Buttons to switch between children. |

## 6. Administrator (laptop)

| # | Screen | Address | Status | What it does |
|---|---|---|---|---|
| 6.1 | Missing information | `/admin` (tab) | Built | "4 of 16 children are missing information": a table of child, day and chips for no consent form, no 1st/2nd emergency contact, no pickup adult, no medical answer (R-027). Nice to add: "Email the parent a reminder". |
| 6.2 | Groups | `/admin` (tab) | Partly built | Today's groups with a count out of 6, move children between groups, a "Not in a group yet" list, and a create-group form. Moving a 7th child into a group is refused (R-028). **Missing:** choosing which lesson day to edit (it's only today now), and copying groups from last week. |
| 6.3 | Lesson days | `/admin/lesson-days` | Not built | List of the season's Saturdays and Sundays. Add, remove or cancel a day, for example for weather (R-028). |
| 6.4 | Children | `/admin` (tab) | Built | All children: age, level, day, order number, today's status, and check-in details (time, staff, jacket/pants/helmet) (R-033). Edit and Report missing buttons. Needs search and a filter by day. |
| 6.5 | Edit child | sheet | Partly built | Name, level, program day. **Missing:** editing the child's adults, medical alerts and consent as admin, reusing the parent forms 2.4, 2.6 and 2.7 (R-029). |
| 6.6 | Staff accounts | `/admin/staff` | Not built | List of staff: name, email, role. Add staff (name, email, role: instructor, desk, patrol, admin), which sends an invite email. Change role, disable account (R-003). |
| 6.7 | Parent accounts | `/admin/parents` | Not built | Which parent sign-ins are linked to which children. Link or unlink, and resend the welcome email. |
| 6.8 | Access record | `/admin` (tab) | Built | Time, who, role, child, what was looked at. Covers medical detail views and patrol access during searches (R-030). Needs a filter by child and by date. |
| 6.9 | Store spreadsheet import | `/admin` (tab) | Built | Choose a .csv file or paste it, then "Import" and "1 new child added, 1 updated." Bad rows are listed with the reason (R-031). Nice to add: a preview of changes before importing. |
| 6.10 | Search history | `/admin/searches` | Not built | All past searches: child, reported by, times, outcome, police shared, notice mailed. Useful for the insurer's questions. |

---

## Summary

- **47 screens and parts of screens.** 32 are built, 5 are partly built, and 10 are not built.
- **Most important new screens:**
  - staff accounts (6.6): no one can create an instructor without it;
  - welcome / set password (1.3): parents can't get in without it;
  - lesson days (6.3);
  - admin editing contacts and medical (6.5).
- **Engineering work rather than screens:**
  - instructor screen loading with no wifi (3.5);
  - instant patrol alerts (5.2).
