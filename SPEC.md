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
- Staff and parent passwords and sign-in codes are kept by Piezas sign-in, never as records here. Account: a person's sign-in, name, role and, for a parent, their children; only the server can write it.

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
