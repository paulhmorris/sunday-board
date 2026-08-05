# Handoff: North Texas Worship Musicians Marketplace — Phase 1 & 2 Wireframes

> **Amended 2026-08-05.** As delivered, this file stated that pay is set at the
> Service level. That was incorrect and contradicted both `product-spec.md` (the
> authoritative spec) and `CONTEXT.md`. **Pay is per Role Slot.** The pay
> statements below have been corrected in place; see
> `docs/adr/0001-pay-is-per-role-slot.md`. The wireframe file itself
> (`Worship Marketplace Wireframes.dc.html`) still shows a service-level pay step
> in flow `2c` and has not been regenerated — build from this README, not from
> that screen.

## Overview

A web marketplace connecting worship musicians with churches in North Texas. This package covers the full Phase 1 (Early Access: waitlist, signup, profile creation, optional verification, admin) and Phase 2 (Launch: public feed, service posting, applications, applicant review, notifications, post-service feedback) user flows, as click-through low-fidelity wireframes.

## About the Design Files

The bundled file (`Worship Marketplace Wireframes.dc.html`) is a **design reference created in HTML** — it is a flat, greyboxed wireframe canvas, not production code and not final visual design. Do not copy its markup, CSS, or grey/red placeholder styling into the product. The task is to **recreate the flows and screens described here in the target codebase's actual environment** (whatever frontend framework/stack the product uses, or the best-fit choice if none exists yet), applying that codebase's real design system for all visual styling.

## Fidelity

**Low-fidelity (lofi).** Every screen is a greybox wireframe: boxes, rule lines, and generic chip/button shapes stand in for real components, and all "photos" are labeled placeholders. Colors (near-black ink, off-white background, one red accent used only for annotations) are a wireframe convention, not brand color — ignore them. Use these files strictly for **layout, content structure, field lists, and navigation/flow logic**; apply the product's real design system for typography, color, spacing, and component styling.

Two annotation conventions run throughout the file and matter for implementation:

- **Blue handwritten notes** = open product decisions the designer flagged as unresolved — see "Open Decisions" below. Do not assume an answer; confirm with product before building.
- **Red handwritten notes** = a behavior rule the screen is enforcing (e.g. an auto-withdraw, a validation rule, an equal-treatment rule) — these ARE specified and should be implemented as stated.
- **`$` red-bar notes** = monetization opportunities (proposed or spec'd) — informational only, not required for Phase 1/2 build.

## How the file is organized

Single scrollable canvas, top to bottom, in numbered "turns" (`t0`, `t1`, `t2`) each containing lettered flow options (`1a`, `1b`, …, `2a`, …). Each flow is a horizontal row of connected screens read left-to-right, arrows indicating the click-through path. In-file links like `→ 2f` jump between related flows.

- **t0** — Legend + two cross-cutting principles that apply to every screen (see below).
- **t1 — Phase 1 (Early Access):**
  - `1a` Landing/waitlist — 3 sequential states: pre-launch waitlist → Early Access (profiles open, no feed) → post-launch (feed live, logged out)
  - `1b` Sign up flow — account type picker, account+age, phone entry, code verification (incl. duplicate-phone error), branch to profile creation
  - `1c` Musician profile creation — roles multi-select, region + style tags, bio + links, optional Facebook verification, finished profile + edge case
  - `1d` Church profile creation — church details, optional domain email verification, church home/empty state
  - `1e` Co-admin invite + musician/church view switcher
  - `1f` Admin — overview stats, musicians table, churches table, shared row-detail drawer
- **t2 — Phase 2 (Launch, core loop):**
  - `2a` Public service feed — desktop, mobile + filter sheet, over-filtered empty state, cold-start empty board
  - `2b` Service detail — one-time service, ongoing service, filled/expired/canceled states
  - `2c` Church: post a service — type (one-time/ongoing), details, role slots (each carrying its own pay), posted/pending review/edit/cancel
  - `2d` Musician: apply to a role slot — logged-out gate, pay reveal, double-book warning, submitted confirmation
  - `2e` Musician: my applications — active list, withdraw, all terminal/past states (8 distinct statuses)
  - `2f` Church: review applicants per slot — applicant list by slot, accept with auto-withdraw warning, after-accept state, reject
  - `2g` Notifications — musician inbox, church inbox, email template
  - `2h` Post-service feedback — prompt, musician→church reasons, church→musician reasons (different lists), confirmation
  - `2i` Admin — first-post review queue, flag queue, self-dealing signal queue
  - `2j` Monetization map (reference only, not a screen to build)

## Two cross-cutting rules (apply to every screen you build)

1. **Pay types render as equals.** Paid / Volunteer / Negotiable must use identical visual weight, styling, and order everywhere (feed cards, filters, service detail, post form) — no color-coding, no icons, no implied ranking. There is no sort-by-pay control anywhere.
2. **No theology/denomination/affiliation field, filter, or tag anywhere.** A church may mention it only in its free-text "About" description. "Musical style" tags (contemporary, gospel, traditional, liturgical, acoustic) are the only style-like facet, and must not be relabeled or treated as denominational.

## Interactions & Behavior (key flows)

- **Signup:** account type (Musician/Church) → email/password/age+ToS checkbox (age self-attested, no vetting disclaimer) → phone entry → 6-digit code (duplicate-phone number shows inline error with login/support path, not a dead end) → branches to profile creation. Badges (Founding Member, New Here) are additive-only — never a greyed-out/missing state.
- **Musician profile:** roles are a fixed multi-select taxonomy (not free text) so church-side filters stay reliable; "Other" opens a text field that is NOT filterable. Style tags never block applying. Bio/links have a "profile strength" nudge meter (not shown to churches). Facebook link is optional, explicitly stated as posting/reading nothing but account age; skip is equal-weight to link.
- **Church profile:** name, city, region only — no denomination field. Optional domain-email verification; failing (e.g. gmail.com) must not read as "not a real church" — copy explicitly says they can still post and verify later. First service post from any church goes into a manual review queue (`2i`/`1f`) before going live; disclosed to the church up front with a time expectation.
- **Feed & filters:** filter facets are region, role, musical style, pay type, service type (one-time/ongoing) — never pay amount, never sort-by-pay. Filtering by pay type means "this Service has an **open** slot of that pay type" — a Service whose only Paid slot is already filled must stop appearing under a Paid filter. Mobile uses a bottom filter sheet with a result-count-on-apply-button pattern. Empty states must always show the unfiltered result count and a one-tap way to widen filters, never a bare "no results."
- **Service detail:** pay TYPE is always shown, per slot in the role list rather than as one service-level line; pay AMOUNT is withheld and only revealed inside the apply flow, in the same visual slot the amount would occupy ("Amount shown when you apply"). Filled/expired/canceled services stay reachable at their URL with an explanation and a "see open services" path (their links get shared externally and must not 404).
- **Post a Service:** type (One-Time vs Ongoing) is chosen first and changes downstream fields (fixed date vs. free-text "typical schedule" + monthly renewal requirement for Ongoing). Pay is set **per role slot**, not at the service level — one Service may carry slots with different pay types and amounts (a paid drummer alongside a volunteer vocalist is one Service, not two). Role "slots" are explicitly one-seat-each; multiple identical roles require multiple slots, and a slot's amount is therefore unambiguously per-musician. Canceling a service requires confirming with the exact count of applicants who will be notified.
- **Apply to a slot:** logged-out users see a time-cost-stated gate before signup, and must land back on the same apply form post-signup. The pay amount reveal is the first thing shown on the apply screen, before any note-writing effort. A double-booking warning (same-day conflict with an already-ACCEPTED application) is a warning, not a block. Submitting cross-sells other open slots on the same service the musician is also qualified for.
- **My Applications / withdraw:** contact details (email/phone) only ever appear once an application reaches ACCEPTED. Terminal states to implement distinctly: Applied, Accepted, Not Selected (never show the word "Rejected" to musicians), Service Filled, Service Canceled, Auto-Withdrawn, Completed, Withdrawn by You, Expired (church never responded).
- **Applicant review (church side):** applicants are grouped and reviewed per role slot, not as one flat pool. **Accepting one applicant for a slot must auto-withdraw that same musician's other pending applications on the same Service** — this must be shown as an explicit warning at accept-time (naming the affected slot) and reflected afterward as a visible history note on the now-open slot, plus a notification to any other applicants that the slot was filled. Rejecting requires no reason from the church and shows none to the musician.
- **Notifications:** every notification names the object (service/slot/church/musician) and gives a next action; email mirrors in-app copy/deep-links exactly. A cancellation on an already-accepted application is the single highest-severity notification (visually distinct).
- **Post-service feedback:** thumbs up/down, followed by a reason-tag set that **differs by direction** — Musician→Church tags (Paid Promptly, Well Organized, Clear Communication, Welcoming, Respectful of My Time, Would Play Again / Didn't Pay, Paid Late or Partially, Canceled Last-Minute, Disorganized, Different Than Described, Unwelcoming, Other) vs. Church→Musician tags (Punctual, Skillful, Prepared, Easy to Work With, Great Attitude, Flexible, Would Book Again / No-Show, Late, Unprepared, Not the Right Fit, Hard to Reach, Other). Feedback is always private — never shown to the other party, never a public rating/star system. Skippable, and re-prompted at most twice (immediately after + 3 days later).
- **Admin:** first-post review queue (per-church, one-time gate — should be near-empty in steady state), a flag queue (manual only, no automated strikes/suspension), and a self-dealing signals view (shared-device / concentrated-completions detection — informational, action is always a manual "open case," never automatic). Admin overview surfaces signup counts, profile completion rate, verification rates, and role-supply mix by region. Musician/church tables share one row shape and one detail-drawer shape.

## State Management

Key entities and states a real implementation will need to model:

- **Account:** type (Musician | Church), phone-verified (bool, required), age-attested (bool), optional Facebook link (age-in-years, verified bool), badges (Founding Member, Verified — additive/derived, never stored as a "missing" state).
- **Musician profile:** roles (multi-select from fixed taxonomy + free-text "other," non-filterable), regions (multi-select from lookup list), musical style tags (multi-select), bio, profile links (list), "actively looking" toggle, profile-completeness (derived %).
- **Church profile:** name, city, region, optional About text, optional domain-verification (domain, verifying email, verified bool), post count this billing period vs. cap, admin list (owner + co-admins), co-admin invite (pending/accepted, revocable link or email).
- **Service:** type (One-Time | Ongoing), title, description, date+time (One-Time) or free-text schedule + renewal date (Ongoing), musical style tags, status (Pending Review | Open | Partially Filled | Filled | Expired | Canceled), review status for first-post-per-church. **No pay fields** — pay lives on the Role slot.
- **Role slot:** belongs to a Service, one seat, role type (taxonomy), pay type (Paid | Volunteer | Negotiable), pay amount (private until applied), status (Open | Filled), accepted applicant (nullable).
- **Application:** musician, slot, note (optional, links stripped), status (Applied | Accepted | Not Selected | Service Filled | Service Canceled | Auto-Withdrawn | Withdrawn by Musician | Expired | Completed), timestamps.
- **Feedback:** application reference, direction (Musician→Church | Church→Musician), sentiment (up/down), reason tags (direction-specific list), free-text (optional), private (never exposed to the rated party).
- **Notification:** recipient, type (enumerated per event above), read state, object references, matching email send.

State transitions to get right: accepting a slot application must cascade auto-withdraw to the same musician's other pending applications on that Service (not other Services); canceling a Service must cascade to Canceled on all its open applications and fire notifications; a Service's first post per Church blocks visibility until admin-approved, all subsequent posts by that Church go live immediately.

## Design Tokens

None to extract — this is intentionally an unstyled greybox wireframe (near-black ink `#201e1d`, off-white ground `#f0eee9`, one red `#ec3013`/`#b4260f` used only for wireframe annotations, plus neutral greys for placeholder fills). Apply the target codebase's real design system/tokens for all colors, type, spacing, radius, and elevation. Do not carry any hex value from this file into production.

## Assets

No real photography, icons, or brand assets are used — all imagery is a labeled grey placeholder box (e.g. "PHOTO"). Source real profile photos, church logos, and any iconography from the product's own asset pipeline / design system.

## Files

- `Worship Marketplace Wireframes.dc.html` — the full wireframe canvas described above (open directly in a browser).
- `product-spec.md` — the source product spec this design was built from (features, phases, and business rules referenced throughout the wireframes; Monetization, Legal & Privacy, Spam & Misuse Protections, and Feature Flag sections were intentionally out of scope for this wireframe pass, aside from a few new monetization ideas gathered as annotations).

## Open Decisions

These are flagged as blue handwritten notes at their screen in the wireframe file and have **not** been resolved — confirm with product before implementation:

- Whether "liturgical"/"gospel" stay as musical style tags or get trimmed to purely musical descriptors, given their denominational overtones.
- Whether churches can draft/save services during Early Access to auto-post at launch.
- Full musician role taxonomy (spec lists 6 + Other — likely missing worship leader, sound/AV, strings, horns).
- Whether unverified churches show any (even neutral) indicator on the feed, or the badge is purely additive/invisible when absent.
- Whether a co-admin can remove the owner or post beyond the church's post cap.
- Whether applicant counts per slot are shown publicly on the feed/detail page.
- Whether role-slot names must come from the fixed taxonomy only, or allow free text (breaks filtering if so).
- Whether a musician's applying to a slot outside their listed roles is blocked, warned, or unrestricted.
- Whether pay amount is required for Negotiable slots (fixed figure vs. range); whether Volunteer can carry a stipend amount. (The per-musician-vs-total-to-split half of this is **resolved** — a slot is one seat, so its amount is always per-musician. See `docs/adr/0001-pay-is-per-role-slot.md`.)
- Whether "Undo" on an acceptance is offered (and for how long), given it requires reviving auto-withdrawn applications.
- Whether a musician can withdraw an already-ACCEPTED application (a de facto cancellation on the church).
- Whether/when a feedback prompt fires for Ongoing services, which have no natural end date.
- Whether admin gets a UI at all in Phase 2 or runs on internal tooling for the first months.
- Whether view-only "impersonate" is in scope for Phase 1 admin, given its trust/risk profile.
