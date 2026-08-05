# ADR-0001: Pay is per Role Slot, not per Service

**Status:** Accepted
**Date:** 2026-08-05

## Context

Two source documents disagree about where pay lives.

`docs/design-handoff/README.md` (flow `2c`, "Post a Service") states that pay is
set at the **Service** level, applying to every Role Slot on it, and that
differently-paid roles therefore require separate Service posts. Its state model
puts `pay type` and `pay amount` on the Service entity.

`CONTEXT.md` states the opposite: pay type and exact amount belong to the **Role
Slot**, and pay is never set at the Service level.

The disagreement had to be settled before any Phase 2 ticket (feed, service
posting, apply flow, applicant review) could be written, because it changes the
schema, the feed query, the post form, and the pay-reveal step in the apply
flow.

## Decision

**Pay is per Role Slot.** Pay type and exact amount are columns on the Role Slot,
not on the Service. There is no pay field of any kind on a Service.

## Consequences

- A Service may carry Role Slots with different pay types and different amounts.
  A church posting a paid drummer and a volunteer vocalist posts **one** Service,
  not two.
- A Role Slot is exactly one seat, so its amount is unambiguously per-musician.
  There is no "total to split" and no per-musician-vs-total ambiguity to resolve.
  This also settles part of the handoff's open decision on whether pay amount is
  per-musician or a total.
- The pay amount revealed in the apply flow is the amount for **that one slot**,
  which is what the musician is actually agreeing to.
- Filtering the feed by pay type means "this Service has an **open** Role Slot of
  that type" — a Service with a filled paid slot and an open volunteer slot
  matches Volunteer, not Paid.
- Pay-type chips on a Service card summarize the pay types across its open slots.
  They render at equal weight in a fixed canonical order, never ordered by
  amount, since ordering by amount leaks exactly the ranking the equal-treatment
  rule exists to prevent.
- Sort-by-pay remains structurally impossible: amounts are revealed only at the
  moment a Musician clicks Apply, and only for the one slot.

## Still open

Whether the feed's primary unit is a Service or a Role Slot is a **separate**
question and remains unresolved (see `CONTEXT.md`, Open questions). Pay-per-slot
makes a Service-with-mixed-pay a real and common case, which sharpens that
question but does not answer it. It must be settled before the feed query is
built.

## Note on the handoff

`docs/design-handoff/README.md` has been corrected in place and carries an
amendment note at the top recording what changed. The wireframe file itself
(`Worship Marketplace Wireframes.dc.html`) has **not** been regenerated and still
renders a service-level pay step in flow `2c` — treat that screen as stale.

`docs/design-handoff/product-spec.md`, the authoritative spec, already specified
per-slot pay and needed no change. It also gives the rationale: a church prices
roles differently within one posting, and forcing separate Service posts per rate
would be busywork against the post cap.
