# North Texas Worship Musicians Marketplace — Product Spec (MVP)

## 1. Overview

A web marketplace connecting churches needing musicians with musicians looking for services, replacing ad-hoc Facebook group posts. Core principle: **generous, not paywalled** — the entire matching loop (post, apply, accept, message) is free. Monetization is limited to optional visibility boosts.

## 2. Phased Rollout Roadmap

Everything in this spec is real, but not everything ships at once. Three phases, each gated on the previous one proving out before adding scope.

### Phase 1 — Early Access

Goal: get real churches and musicians signed up and building profiles before there's anything to _do_. No feed, no posting, no applying.

- Account creation for both Church and Musician types (16+ minimum age)
- Phone verification (mandatory, all accounts)
- Musician profile: instruments/roles (fixed taxonomy, multi-select), bio, style tags, region, profile links
- Church profile: name, city, region
- Optional verified badges: Facebook-link (musicians), domain-verified email (churches) — safe to enable early since they're profile-only, no feed dependency
- "Founding Member" badge for everyone who joins during this window
- Region lookup table in place (North Texas to start, structured for expansion)
- Legal basics live from day one: ToS, privacy policy, account deletion
- "How We Started" page and waitlist mechanics for the Facebook group announcement

### Phase 2 — Launch (core loop only)

Goal: the actual marketplace loop works, is stable, and is being watched closely. Deliberately narrow — this phase is about analytics, infra stability, and bug catching, not adding features.

- Churches post Services (One-Time and Ongoing types), with role slots
- Public Service feed (browsable without an account, apply requires one)
- Musicians apply to a specific role slot; withdraw their own application
- Church accepts/rejects per slot; accepting one slot auto-withdraws a musician's other pending applications on that Service
- Pay set per role slot; pay type shown publicly, exact amount revealed at apply time, no sort-by-pay
- Service expiration (24hrs post one-time service date; monthly renewal for ongoing)
- Edit/cancel a Service, with applicant notifications on cancellation
- Rejected/unfilled applicant notifications ("this Service was filled")
- Post cap (starting at 4/month, config-driven, not hardcoded)
- Manual first-post review; flag/report system live (needed once there's content to flag)
- Self-dealing detection (unverified-church stat exclusion, same-device/payment linking check)
- Post-Service feedback collection (thumbs up/down + reason tags, both directions) — start collecting data here even though badges built from it come later
- Email notifications (in-app + email, per earlier decision)

### Phase 3 — Post-Launch (phased rollout, prioritize from here)

Goal: everything that depends on Phase 2 data existing, or that carries enough risk to want a cohort-gated rollout (see Feature Flag & Rollout Candidates section). Suggested rough order, open to re-prioritization once Phase 2 usage data comes in:

1. Earned trust badges (needs completed-Service + feedback volume from Phase 2 to be meaningful)
2. Musician directory + "Actively Looking" flag + church-initiated invites (cannibalization risk — cohort-gate per earlier decision)
3. Connection history ("black book") + blocking
4. No-show/no-pay escalation flow (pattern detection across churches, admin alerts)
5. Boost (monetization)
6. Local sponsor placements, tip jar
7. Subscription tier exploration (only if Phase 3 monetization proves insufficient)

## 3. Account Types

- **Church account** — creates and manages services, reviews applicants
- **Musician account** — browses services/directory, applies, manages own applications
- **Linking:** A musician can be added as a co-admin of a church account via an invite link/code sent by the church, and can switch between their musician view and church view. No approval queue needed.
- **Minimum age:** 16+ to create an account. Platform does not perform background checks or vetting — that responsibility is explicitly the church's, stated clearly in onboarding/ToS.

## 4. Core Entities (conceptual, not implementation)

- **Church** — name, city, region, verification status
- **Musician** — instruments/roles (multi-select from a fixed taxonomy list, e.g. Drums, Bass, Vocals, Keys, Acoustic Guitar, Electric Guitar, with an "Other" escape hatch — not free text, to keep search/filter reliable; a musician can hold multiple roles), bio, style tags, region(s) willing to serve, "Actively Looking" flag, profile links (YouTube/Spotify/Instagram/etc.), trust stats
- **Region** — stored in its own lookup table (not hardcoded), starting with "North Texas," expandable to new regions over time. No geocoding or radius search in MVP — region is a simple filterable value.
- **Service** — belongs to a church; has a title, `serviceType` (One-Time or Ongoing/Permanent), description, one or more **Role Slots**. Pay is _not_ set at the Service level — see Role Slot. One-Time services have a scheduled date/time; Ongoing services instead have a free-text typical schedule (e.g. "Sundays 9am + Wednesdays") and no fixed date.
- **Role Slot** — a single role within a service (e.g. "Drummer," "Vocalist"), each with its own **pay type and exact amount**, status, and applicants. A service is considered filled when all its role slots are filled. Pay is per-slot because a church prices roles differently within one posting — a drummer, an electric guitarist, and an audio engineer on the same Sunday are not necessarily worth the same rate, and forcing separate Service posts per rate would be busywork against the post cap. Since a slot is exactly one seat, its amount is unambiguously per-musician; there is no "total to split" concept.
- **Application** — a musician applying to a specific role slot (not the service as a whole). Status: Applied → Accepted / Rejected.
- **Invite** — a church-initiated outreach to a musician from the directory. Always creates a lightweight service/role-slot behind the scenes (not a raw contact exchange) so it flows through the same application/acceptance system.
- **Flag/Report** — raised by any user against a service, church, or musician profile; visible only to platform admin.
- **Feedback Signal** — private post-service thumbs up/down from both church and musician, visible only to platform admin, feeds trust stats but is never shown publicly or to the other party.

## 5. Service Lifecycle

1. Church creates service with one or more role slots
2. Service is publicly browsable (no account needed to view)
3. Musicians must have an account to apply to a specific role slot
4. Church reviews applicants per slot, accepts or rejects
5. Service is "Filled" once all slots are accepted; "Open" until then
6. **Expiration:**
   - One-Time services auto-expire 24 hours after their service date/time, regardless of fill status
   - Ongoing/Permanent services expire monthly and must be renewed by the church to stay listed — keeps the ongoing-service inventory trustworthy/current
7. **Editing:** church can edit service details anytime while open
8. **Cancellation:** church can cancel a service at any time; all applicants (any status) are notified and their applications move to a "Service Canceled" state — never silently deleted
9. **Withdrawing an application:** a musician can withdraw their own application at any time; the church is notified
10. **Double-booking:** not blocked by the platform, but the musician is shown a warning at the application stage if they're applying to a service/date that conflicts with one they've already been accepted to
11. **Rejected/unfilled applicants:** when a role slot is filled by someone else, all other applicants to that slot are notified (e.g. "This service was filled — see what else is available") rather than left hanging with silence
12. **Multi-role musicians:** a musician qualified for more than one open slot on the same service can apply to multiple slots (separate application per slot). Accepting them into one slot auto-withdraws their other pending applications on that same service — a musician can't hold two slots on one team.

## 6. Discovery

- **Service feed:** filterable by region, role, style tag, pay type; boosted services pinned to top of filtered results. No sort-by-pay option, structurally — see pay visibility rule below.
- **Pay visibility:** the pay `type` (Paid / Volunteer / Negotiable) is shown publicly on the feed and Service detail page, but the exact dollar amount is hidden from public browsing. It's revealed only at the moment a musician clicks "Apply," before they submit — and since pay is per-slot, the musician sees exactly the one slot's amount, never the other slots' rates on the same Service. This gives enough information to decide without turning the feed into a price-sortable listing, keeping the "hunt for the highest payer" behavior structurally impossible rather than just discouraged.
  - On the Service detail page, pay type is shown per slot in the role list rather than as one service-level line.
  - Feed filtering by pay type means "this Service has an **open** slot of that pay type" — a Service whose only Paid slot is already filled must stop appearing under a Paid filter.
- **Musician directory:** churches can browse musician profiles directly and send an Invite (see Invite definition above). Contact info is not exposed until the musician accepts.
- **"Actively Looking" flag:** musicians can toggle this on their profile to signal they're currently seeking a service or permanent position — surfaced/filterable in the directory. Chosen over a separate broadcast/listing entity to keep MVP scope small; revisit as a standalone "Listing" concept later if the flag proves insufficient.
- **Style tags:** multi-select tags (contemporary, traditional, gospel, liturgical, etc.) on both services and musician profiles, used as a filter, not a hard requirement.

⚠️ **Open question (unresolved) — mixed-pay Services:** now that pay is per role slot, a single Service can carry a mix of pay types (e.g. a paid drummer alongside a volunteer vocalist). Not yet decided how the feed represents this. Two directions, not yet chosen:

- **Service-oriented card (status quo shape):** the card shows the distinct set of pay types across its open slots ("Paid · Volunteer"). Keeps one card per Service, but a musician filtering for "Paid" may click into a Service where the only paid slot isn't their instrument.
- **Slot-oriented feed:** each open role slot is its own feed row. Filters become exact — a drummer filtering Paid sees only paid drummer slots — at the cost of one Service occupying several rows and a busier board, which matters most at cold start when inventory is thin.

Whichever is chosen, the equal-treatment rule still binds: pay-type chips render with identical weight in a fixed canonical order, never ordered by amount (ordering by amount would leak the ranking the no-sort-by-pay rule exists to prevent). Worth deciding before the feed query is built — it determines whether the feed's primary unit is a Service or a Role Slot.

⚠️ **Open question (unresolved):** risk of churches using the directory once to build a private contact list, then abandoning the platform ("scrape and leave"). Default mitigation for launch: contact info stays hidden until a musician accepts an invite. Revisit with real usage data — may need to gate directory browsing behind an active-posting requirement later.

## 7. Messaging

- No open-ended chat/DM inbox in MVP
- Structured one-shot note field on applications and invites (like a cover note)
- Status changes (applied, accepted, rejected, canceled) trigger notifications

## 8. Connection History & Blocking

- **Church side ("black book"):** a church can browse a list of every musician they've completed a Service with, including which Service(s) they were on, and reach out again with one click. Reaching out reuses the existing Invite flow (not a separate messaging feature) — creates a real Service/role-slot behind the scenes, keeps activity and stats consistent, and still requires the musician's explicit acceptance even though they've worked together before.
- **Musician side (mirrored):** a musician can browse the churches they've worked with the same way, with one key difference — a musician can **withdraw** themselves from a specific church's black book at any time. Withdrawal is silent (no notification to the church); the musician simply no longer appears in that church's list. This only removes the black-book shortcut — the church can still find and invite that musician through normal directory search, since withdrawal isn't a block.
- **Blocking (distinct from withdrawal):** either party can fully block a specific counterpart. A church can block a musician from applying to any of their Services; a musician can block a church from inviting them at all. Unlike withdrawal, blocking is a complete stop, not just a black-book shortcut removal. Silent to the blocked party, same as withdrawal, to avoid confrontation.

## 9. Trust & Reputation

Philosophy: trust markers should be earned from objective behavior, not subjective public reviews (avoids small-community awkwardness of rating your own church/musician by name).

**Design principle — absence should never read as distrust:** a reputation system's biggest risk is that missing badges get misread as red flags rather than "hasn't had the chance yet," especially for every early user on the platform at once. Four rules to prevent that:

1. **Additive-only display:** only render badges a profile has actually earned. Never show a full badge list with some grayed out — an empty trophy case reads as failure, not newness.
2. **A different positive signal for new users:** since trust badges require history new users don't have, lean on what they do have immediately — a complete bio, style tags, and profile links (samples, socials). Profile completeness is a UI nudge, not a badge, but should carry real weight in how "credible" a new profile feels, the same way a thorough resume reads as credible before someone's first job.
3. **A neutral "New" tag instead of silence:** rather than leaving an absence unexplained, a friendly "New to [platform]" label reframes it proactively and honestly, rather than letting churches assume the worst.
4. **A time-limited "Founding Member" badge:** since the entire first cohort will look "new" simultaneously (a platform-wide version of the same problem), anyone who joins during the initial launch window earns a permanent "Founding Member" badge — turns "no history yet" into a positive distinction, and stays scarce since it's only available during the launch window.

**Scope boundary:** the platform stays out of church affiliation, denomination, and theology entirely — no fields, filters, or tags for this. Any of that is left to a church's own description text if they choose to mention it. Pay type (paid/volunteer/negotiable) is treated as a neutral, equally-weighted option — never framed as more or less legitimate than another, since this is a sensitive topic in the worship-musician community.

- **Auto-computed stats** (not user-submitted):
  - Musicians: services completed, no-show rate, response time to invites/applications
  - Churches: services posted vs. filled, response time to applicants, repeat-musician rate
- **Earned badges** surfaced on profiles once thresholds are met (e.g. "Reliable," "Fast Responder," "Trusted Church") — modeled after Airbnb Superhost / Amazon Top Choice style indicators
- **Private feedback signal:** post-service thumbs up/down from both parties, visible only to admin, used as an input signal (can suppress badges or flag for manual review) but never shown publicly
- **No-show / no-pay feedback moment:** the platform's involvement ends at the initial connection between musician and church — what happens in an ongoing relationship (e.g. a permanent musician eventually leaving) is not tracked. However, a distinct feedback trigger exists for two trust-critical failures at the connection stage: a musician no-showing after being accepted, or a church not paying / canceling last-minute. Either party can flag this via a lightweight prompt, feeding the private feedback signal above — separate from general reports, and not a moderation escalation by default.
- **Flags/reports:** any user can report a service, church, or musician; reviewed manually by platform admin via an internal queue (no automation/auto-suspension in MVP); flagged status is private until/unless admin takes action

### Feedback loop mechanics

- **Trigger:** an email with a link to the feedback modal is sent once, right after the Service, and again 3 days later if not completed. Feedback is optional — not required to use the platform.
- **Format:** thumbs up/down. A thumbs-down opens a multi-select list of hardcoded reasons plus an "Other" free-text field. Reason lists are separate and specific per direction (not a generic shared list) since the failure modes differ and some reasons carry more weight than others:
  - **Musician → Church** reasons include: didn't pay, canceled the Service (last-minute), and other church-side issues.
  - **Church → Musician** reasons include: no-show, unprepared, and a low-conflict way to flag general fit/quality concerns.
  - These are two separate prompts, not one combined form.
  - A thumbs-up also opens a multi-select list of positive tags (same hardcoded, direction-specific, weightable structure as the negative reasons). Starting examples, not final:
    - **Church → Musician:** punctual, skillful/talented, prepared, easy to work with, great attitude, flexible, would book again
    - **Musician → Church:** paid promptly, well organized, clear communication, welcoming, respectful of time, would play again
    - Different tags can feed different badges (e.g. punctuality feeds a "Reliable" badge, skill/would-book-again feeds a distinct "Highly Rated" badge), rather than all positive tags counting toward one generic score.
- **Weighting:** reasons are hardcoded (not user-defined) specifically so certain ones (e.g. no-show) can be weighted more heavily than others in how they affect trust stats.
- **No-show consequence model:** intentionally avoids automatic punishment to prevent the platform from becoming an accusation-driven "no-show police."
  - A single no-show flag stays entirely private, feeding trust stats only (e.g. suppressing "Reliable" eligibility) — no notification, no action.
  - A pattern is only considered when no-show flags come from **multiple different churches**, not repeated flags from the same church (which would let one bad-faith church manufacture a false pattern). This escalates to a manual admin review, not an automatic suspension.
  - Any suspension is always a human decision, made after review, with the musician given a chance to respond first. Nothing is auto-banned.
  - The same asymmetry is watched on the church side: admins are notified if a church is issuing no-show flags at a meaningfully higher rate than average, surfacing potential flag-happy or bad-faith church behavior without adding a routine review step.

## 10. Monetization

- **Free, forever:** posting Services, applying, accepting/rejecting, directory browsing, invites, messaging notes, badges
- **Post cap:** churches are limited to 4 Service posts per rolling month. This is primarily a spam/inventory-quality control, not a monetization lever yet, but it leaves room to raise the cap or introduce a paid unlimited tier later if the marketplace grows enough to justify it.
- **Boost:** flat one-time fee, pins a Service to the top of relevant filtered search results with a "Featured" badge. Boost lasts until the Service is filled or expires (not a fixed day count).
- **Local sponsor placements:** opt-in, clearly-marked local ads (e.g. music stores, lesson instructors, sound equipment) in the feed or a digest/newsletter. Not a general ad platform, monetizes attention rather than access, keeps every account free to use.
- **Tip jar:** a small "buy me a coffee" style feature supporting the platform/founder directly (a short bio + one-time or recurring tip option), not tied to musicians or churches. Surfaced via a low-key, consistent CTA (e.g. "Help keep this platform free" linking to the tip page) rather than a popup or paywall prompt — framing it as supporting the mission, not a transaction required to use anything.
- **Future consideration:** symmetric musician-side boost (pay to stand out in directory search) — not in MVP scope, noted for later.
- **Future consideration — subscription tier:** if the post cap and boost prove insufficient at scale, a paid subscription (churches and/or musicians) could layer on top, likely centered on priority alerts (instant notification vs. standard/digest timing) and enhanced profile/directory placement. Any such tier should stay purely about efficiency/visibility, not gate the core free loop.

## 11. Explicitly Out of Scope for MVP

- Standalone musician "Listing" broadcast entity (reduced to an "Actively Looking" profile flag for MVP)
- Threaded/open-ended messaging
- Musician availability calendars
- Audio/video upload (profile links only)
- Public star ratings/reviews
- Geocoding or radius-based search
- SMS notifications (email + in-app only)
- Automated moderation/strikes
- Payment processing beyond the one-directional boost fee (no payouts/escrow between churches and musicians)

## 12. Legal & Privacy

- **Liability disclaimer:** the platform is not a party to any agreement, payment, or dispute between a church and a musician (outside of the boost fee itself). Pay arrangements, no-shows, cancellations, and disputes are between the two parties. This should be explicit in Terms of Service and reinforced at key moments (e.g. accepting an application).
- **Data privacy:** clear privacy policy covering what's collected (profile info, contact info, activity), how it's used, and that it's not sold/shared beyond platform function.
- **Account deletion:** full self-service account deletion, removing personal data (profile, contact info, links) while anonymizing historical records needed for integrity (e.g. a completed service stays on record for the other party's stats, but stripped of identifying info).

## 13. Spam & Misuse Protections

- **Self-dealing / fake trust-stat inflation** (e.g. one person creates a fake church and "services" themselves to pad their own musician stats): new churches are "unverified" by default — services from an unverified church don't count toward a musician's trust stats until the church clears review or a minimum active period with no reports. Flag accounts where the same person/device/payment method links a church and the musician benefiting from its services.
- **Free-advertising / junk postings:** a monthly post cap (also serving as the premium-tier gate) limits how much free inventory any single account can spam. Combined with the manual first-post review and flag/report system.
- **Sybil accounts (duplicate accounts to game applications or stats):**
  - **Dedup:** phone number verification required for all accounts (free, one phone = one account) — friction-based, not payment-based, to catch bulk fake-account creation at scale without feeling like a paywall.
  - **Verified badge (musicians):** optional, free — link a Facebook account to earn a "Verified" badge, since this community already trusts Facebook identity. To resist fresh-fake-account gaming, the badge only grants if the linked Facebook account exceeds an age threshold (e.g. 1+ year old) — raises the effort bar without charging anyone.
  - **Verified badge (churches):** optional, free — church provides their organization's domain (e.g. gracechurch.org) and verifies an email address at that domain (e.g. staff@gracechurch.org) via a confirmation link/code sent to it. A generic email (gmail, yahoo, etc.) doesn't qualify. Zero-cost, hard for a fake church to fake since it requires actually controlling the domain's mail.
- **Report/flag abuse (mass-flagging to bury someone):** flags remain private and require admin action to have any visible effect — abuse creates admin review workload but not direct harm to the flagged party, since nothing is automatically actioned.
- **Ban evasion:** not fully solvable at MVP scale without harder identity verification; accepted risk for now, revisit (e.g. phone-number-based re-ban detection) if it becomes a real pattern.
- **Contact-harvesting / phishing via the one-shot note field:** short character limit on notes, with links stripped/blocked (basic URL detection), since it's the only free-text surface in the app.

## 14. Feature Flag & Rollout Candidates

Not architecture, but operational guidance for the build phase: these features carry enough risk (unproven demand, sensitive dynamics, or dependency on data that doesn't exist yet) that they're good candidates for PostHog feature flags, gated to specific cohorts before a full rollout, rather than shipped on for everyone at launch.

- **Boost:** validate demand/pricing with a small cohort of churches before opening to everyone.
- **Directory invites (church → musician):** the cannibalization risk flagged earlier in this spec is still unresolved — worth gating to churches meeting a minimum posting/verification threshold first, rather than opening broad directory browsing on day one.
- **Earned trust badges:** these need real completed-Service volume to mean anything. Launch with only the "New" tag and "Founding Member" badge on for everyone; gate the stats-based earned badges (Reliable, Fast Responder, etc.) behind a flag until there's enough data for them to be meaningful rather than misleading.
- **No-show flagging / escalation flow:** sensitive by nature — consider soft-launching to a small cohort first to catch edge cases (false flags, unclear UI) before it's live for every church/musician pair.
- **Local sponsor placements:** test with a limited region or a handful of sponsors before treating it as a standard revenue line.
- **Verified badges (Facebook link, church domain verification):** phone verification should be mandatory for everyone from day one (not a toggle), but the optional Facebook/domain verification badges can be rolled out to a cohort first to watch for edge cases (e.g. legitimate churches without a custom domain).
- **Connection history ("black book"):** inherently depends on churches/musicians having completed Services together — natural to gate behind a flag that auto-enables per-account once they have real history, rather than showing an empty feature to everyone immediately.
- **Post cap value:** keep the exact cap (currently 4/month) behind a flag/config value, not hardcoded, so it can be tuned per cohort or over time without a redeploy.
- **Tip jar & subscription tier (future):** low-risk but easy wins to flag simply for a clean on/off switch and easy experimentation on placement/copy.

## 15. Launch Plan (non-technical)

- Announce in the North Texas Worship Musicians Facebook group
- Build a waitlist ahead of public launch
- Seed the platform with real services pre-launch so early visitors see genuine activity rather than an empty board
