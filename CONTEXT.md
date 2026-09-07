# Context: Sunday Board

A web marketplace connecting churches that need musicians with musicians looking
for work, starting in North Texas. Replaces ad-hoc Facebook group posts.

Core principle: **generous, not paywalled** — the whole matching loop (post,
apply, accept, message) is free. Monetization is optional visibility boosts only.

## Glossary

Use these terms exactly. Where a synonym is listed as avoided, don't drift to it.

- **Church** — an account that posts Services and reviews applicants. Has name,
  city, a single Region, and a verification status.
- **Musician** — an account that browses Services, applies to Role Slots, and
  manages its own applications. Holds one or more roles from a fixed taxonomy.
- **Region** — a lookup-table value (not hardcoded, no geocoding, no radius
  search). "North Texas" to start. A Musician may serve several; a Church has one.
- **Service** — a posting owned by a Church, containing one or more Role Slots.
  Either **One-Time** (has a date/time) or **Ongoing** (free-text typical
  schedule, renewed monthly). Avoid "job", "gig", "listing" — it is a Service.
  Pay is never set at the Service level.
- **Role Slot** — exactly one seat within a Service (e.g. "Drummer"), carrying
  its own pay type and exact amount, status, and applicants. A Service is Filled
  when every Role Slot is filled. Avoid "position", "role" alone, "seat".
- **Application** — a Musician applying to one specific Role Slot, never to a
  Service as a whole. Nine distinct statuses: Applied, Accepted, **Not
  Selected**, Service Filled, Service Canceled, Auto-Withdrawn, Withdrawn by
  Musician, Expired (the Church never responded), Completed. **Never show a
  Musician the word "Rejected"** — the user-facing term is "Not Selected".
  "Rejected" may appear only in Church-side internal copy and code.
- **Invite** — a Church-initiated outreach to a Musician from the directory. It
  always creates a real Service + Role Slot behind the scenes, so it flows
  through the ordinary Application/acceptance path. Not a raw contact exchange,
  not a message.
- **Pay type** — Paid / Volunteer / Negotiable. Public. The exact **amount** is
  not public.
- **Feedback Signal** — private post-Service thumbs up/down from both sides,
  visible only to admin. Never a public review or star rating.
- **Flag / Report** — a user-raised report against a Service, Church, or
  Musician. Private until an admin acts. Distinct from a Feedback Signal.
- **Trust stats / earned badges** — auto-computed from behavior. Never
  user-submitted, never a public rating.
- **Founding Member** — a permanent badge for accounts created during the launch
  window. Derived at read time from `createdAt`, not a stored column.
- **Actively Looking** — a Musician profile toggle signalling they're seeking
  work. A plain boolean, not a Listing entity (a standalone Listing is
  explicitly out of MVP scope).
- **Black book / connection history** — the list of counterparts a Church or
  Musician has completed a Service with. **Withdrawal** (musician-side, silent,
  removes only the shortcut) is distinct from **blocking** (a full stop).

## Invariants worth knowing before you change anything

- **Pay is per Role Slot**, never per Service. There is no pay field of any kind
  on a Service. A slot is one seat, so its amount is unambiguously per-musician;
  there is no "total to split". A Church posting a paid drummer and a volunteer
  vocalist posts **one** Service, not two.
- **No sort-by-pay, structurally.** Exact amounts are revealed only at the moment
  a Musician clicks Apply, and only for that one slot. Pay-type chips render with
  equal weight in a fixed canonical order — ordering by amount would leak the
  ranking this rule exists to prevent.
- **Filtering the feed by pay type means "has an _open_ slot of that type."**
- **Accepting a Musician into one slot auto-withdraws their other pending
  applications on the same Service.** One musician cannot hold two slots on one
  team.
- **Nothing is silently deleted.** Cancelled Services move applications to a
  Service Canceled state and notify. Unfilled applicants are told the slot was
  filled.
- **No automatic punishment.** No-show patterns require flags from multiple
  distinct Churches and escalate to human admin review; suspension is always a
  human decision.
- **Absence must never read as distrust.** Only render earned badges — never a
  grayed-out full list. New accounts get a neutral "New" tag.
- **The platform stays out of denomination, affiliation, and theology entirely.**
  No fields, filters, or tags. A Church may mention it in free-text `about` only.
- **The platform is not a party** to any agreement, payment, or dispute between a
  Church and a Musician.

## Architecture

- SvelteKit (Svelte 5) + TypeScript, Tailwind, shadcn-svelte, adapter-node.
- Prisma with the `@prisma/adapter-pg` driver adapter; models split under
  `prisma/models/`.
- **Better Auth** owns users, sessions, and email one-time-code verification.
  There is no phone or SMS verification. Its schema is
  generated into `prisma/auth.prisma` — do not hand-edit that file. Our own
  tables reference the auth user id as an opaque `userId` string, **not** a
  foreign key into the auth schema.
- **Transactional email** goes through one seam, `sendEmail()` in `$lib/server/email`.
  Resend is the vendor; without `RESEND_API_KEY` the in-memory transport captures
  mail instead. Resend owns retention, delivery events, and bounce suppression —
  we store none of it.
- **PK/FK convention:** `id` is an autoincrement integer for internal joins.
  Anything referenced in a URL or form action also gets a unique, indexed `uuid`
  column so internal ids never leak.
- **Boolean-as-timestamp convention:** a field that is conceptually "did this
  happen" is a nullable `DateTime` (present = true, `null` = false) rather than a
  boolean — free "when" for later. A field the user toggles back and forth
  (e.g. `activelyLooking`) stays a plain boolean.
- Feature-flag-first for risky surfaces: boost, directory invites, earned
  badges, no-show escalation, post cap value. Phase 1 uses server-side config
  flags; PostHog is the intended Phase 2 home, not a Phase 1 dependency.

## Phase

**Phase 1 (Early Access)** — accounts, email verification, profiles, regions,
legal basics. No feed, no posting, no applying yet. Phase 2 adds the core
marketplace loop; Phase 3 is everything depending on Phase 2 data.

Current state: auth flow and form components built; no domain tables exist yet.
The Phase 1 spec (#25) defines the schema to build.

## Source docs

- `docs/design-handoff/product-spec.md` — product narrative and rationale: the
  features, the business rules, and why each decision was made. Authoritative on
  _why_.
- GitHub issues labelled `ready-for-agent` — the per-phase build specs.
  Authoritative on _what to build_. Phase 1 is #25.
- `docs/design-handoff/README.md` — wireframe handoff. The bundled `.dc.html`
  canvas is stale in places; the README banner lists which screens.

## Open questions (unresolved in the spec)

- **Mixed-pay Services:** is the feed's primary unit a Service or a Role Slot?
  Must be decided before the feed query is built.
- **"Scrape and leave":** Churches mining the directory for contacts then
  leaving. Mitigated for now by hiding contact info until a Musician accepts.

_Settled since: the role/style-tag taxonomy. `Role` and `StyleTag` are seeded
lookup tables — never Postgres enums, never free text — carrying `slug`, `name`,
`sortOrder`, and a nullable `retiredAt`. Seed lists are in the Phase 1 spec._
