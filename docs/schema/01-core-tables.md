# Core Tables — Round 1

Smallest possible starting set, before anything else (Service, Application, etc.) can exist.
No Users/Sessions/Accounts table — that's owned by the third-party auth provider (Clerk/BetterAuth, TBD). Our tables reference that provider's user id as an opaque foreign string, not a foreign key into our own schema.

Everything else in the spec (Service, Role Slot, Application, Feedback, Invite, Flag) hangs off of `Church` and `Musician`, and both of those hang off of `Region`. So this round is just those three.

---

**PK/FK convention (applies to every table from here on):** `id` is an integer (autoincrement) — fast for internal joins. Any field referenced in a URL or form action gets its own `uuid` column (unique, indexed) so nothing internal leaks externally.

**Boolean-as-timestamp convention:** fields that are conceptually a boolean but represent "did this happen" get a nullable `DateTime` instead — value present = true, `null` = false. Free "when" for later, no second column needed.

---

## 1. `Region`

Lookup table. Starts with "North Texas," structured to add more later. No geocoding — just a filterable value.

| Column      | Type           | Notes                   |
| ----------- | -------------- | ----------------------- |
| `id`        | integer        | PK                      |
| `uuid`      | uuid           | public reference        |
| `name`      | string, unique | e.g. "North Texas"      |
| `slug`      | string, unique | URL/filter-friendly key |
| `createdAt` | timestamp      |                         |

**Nothing to decide here** — this table is unambiguous from the spec. Flagging it done unless you see something missing.

---

## 2. `Musician`

Profile only, in this round — no roles/style-tags/links yet (those are their own tables, coming next round, and role taxonomy is an explicit open decision in the handoff doc). Just identity + the fields that don't depend on an undecided taxonomy.

| Column                    | Type                   | Notes                                                                                                            |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `id`                      | integer                | PK                                                                                                               |
| `uuid`                    | uuid                   | public reference                                                                                                 |
| `userId`                  | string, unique         | id from the auth provider — not a local FK                                                                       |
| `displayName`             | string                 |                                                                                                                  |
| `ageAttestedAt`           | DateTime, nullable     | self-attested 16+, no vetting — present = attested                                                               |
| `bio`                     | text, nullable         |                                                                                                                  |
| `activelyLooking`         | boolean, default false | spec §6 — a live toggle the user flips back and forth, not a "did this happen" fact, so it stays a plain boolean |
| `createdAt` / `updatedAt` | timestamp              |                                                                                                                  |

Deliberately **not** in this round: `regions` (many-to-many — musician can serve multiple regions, spec §4), `roles` (fixed taxonomy, undecided per handoff), `styleTags`, `profileLinks`, Facebook-verification fields, derived trust stats. Those all need either a taxonomy decision or a join table, and I don't want to guess at either yet.

`isFoundingMember` is not a column — derive it at read time from `createdAt <= launchWindowEnd` (config value).

Phone verification dropped from this table — Clerk/BetterAuth own that, it lives on the auth provider's user record, not here.

---

## 3. `Church`

Same approach — identity fields only, no admin/co-admin linking or verification yet (those depend on the Invite entity and domain-verification flow, which are their own pieces).

| Column                    | Type                      | Notes                                                                                      |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `id`                      | integer                   | PK                                                                                         |
| `uuid`                    | uuid                      | public reference                                                                           |
| `userId`                  | string, unique            | the _owner's_ auth id — co-admins come later as a join table                               |
| `name`                    | string                    |                                                                                            |
| `city`                    | string                    |                                                                                            |
| `regionId`                | integer, FK → `Region.id` | single region, not multi (spec §4 lists Church as name/city/region — no plural)            |
| `about`                   | text, nullable            | free text; explicitly the only place denomination/affiliation may appear (handoff rule #2) |
| `createdAt` / `updatedAt` | timestamp                 |                                                                                            |

Deliberately **not** in this round: domain-verification fields, co-admin list, post-cap tracking, unverified-status-for-trust-stats flag (spam protection §13). All depend on tables/decisions we haven't gotten to.

`isFoundingMember` — same as Musician, derived at read time, not stored.

---

Round 1 changes applied per your notes: integer PK/FK + separate public `uuid`, `ageAttestedAt` as nullable DateTime, `phoneVerified` removed, `authUserId` → `userId`, `isFoundingMember` derived instead of stored.

Sitting here until you're ready for round 2.
