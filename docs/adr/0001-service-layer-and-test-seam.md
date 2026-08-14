# ADR 0001 — Service layer as the unit-test seam

**Status:** accepted (2026-08-14) · **Context:** Phase 1 (Early Access), issues #25 / #27

## Decision

Decision logic lives in services under `$lib/server/services/`, and those services
are the only thing unit tested. Tests inject a mocked `PrismaClient`; no test
provisions, migrates, or reads a database.

## Conventions

- One file per domain area — `musician-profile.ts`, `verification.ts`,
  `admin-stats.ts` — with a colocated `*.test.ts`. `$lib/server/` is already
  server-only to SvelteKit, so no `.server` suffix.
- Signature: `fn(db: PrismaClient, input: ParsedInput, actor?: Actor)`. Input
  arrives already parsed by the caller's Valibot schema.
- Nothing ambient: services never call `getRequestEvent()`, never read `$env`,
  never import from `$app/*`. **The current time is a parameter**, not
  `new Date()` inside the function — the Founding Member window and code expiry
  are boundary rules that must be callable at a chosen instant.
- Expected failures come back as a discriminated `Result` from
  `$lib/server/errors` — `{ ok: true, data }` / `{ ok: false, reason }`, built
  with `Result.ok()` / `Result.fail()` (namespaced because bare `ok` and `fail`
  are taken by better-auth and `@sveltejs/kit`). The remote function owns the
  mapping to `invalid()`
  and the user-facing copy, and the test asserts the reason without asserting a
  string of copy.

## Failure reasons

`ErrorReason` in `$lib/server/errors.ts` is the app-wide vocabulary — it exists
so the same failure is never spelled two ways. It is **not** the signature: each
service declares the narrow subset it can actually return
(`Result<{ name: string }, typeof ErrorReason.AccountNotFound>`), so a caller's
`switch` stays exhaustive.

Whether a service returns or throws follows one rule: **would a caller ever
write a different `if` for this?**

- **Yes → return a `Result`.** Expected domain outcomes the UI renders
  differently and a test asserts: `code_expired`, `slot_filled`. These are the
  only reasons that belong in `ErrorReason`.
- **No → throw a plain `Error`.** Invariant violations and unrecoverable states.
  Nobody branches on them, they are 500s, and unioning them into every return
  type is noise. Write the message for the person reading Sentry.

A service never throws SvelteKit's `error()` or `redirect()`, and never wraps a
Prisma rejection just to log it — `handleError` in `hooks.server.ts` is the one
reporting site, and `beforeSend` tags each event with the module derived from
its deepest in-app frame. Catch inside a service only to _translate_ a specific
driver error into a domain reason (Prisma `P2002` → `already_applied`),
rethrowing everything else.

A tagged error class earns its place the day a throw needs programmatic
handling; until then its `reason` field would have no consumer, since reaching
the throw path means no caller branches.

Remote functions stay thin — parse, resolve the session, call one service, map
the result — and get **no unit tests**. If a remote function feels worth unit
testing, that is the signal its logic belongs in a service.

`src/lib/server/services/account.ts` is the reference implementation.

## Writing the tests

Use `mockDb()` from `$lib/server/testing/mock-db`, which is
[Prisma's dependency-injection mocking pattern](https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing)
on `vitest-mock-extended`. One mock per test; nothing is shared and no module of
ours is mocked.

Assert **the value the service returned** and **the write it decided to
perform**. Do not assert call ordering, incidental reads, or a call count —
`db.musician.create` being called with the roles the user picked is a decision;
`db.musician.findUnique` running first is an implementation detail.

A test should survive a legitimate refactor and fail on a behaviour change.
Renaming a route, restructuring a remote function, or swapping the email vendor
should change no test body.

## Consequences

Everything the services don't cover — Valibot parsing, the auth gate, cookies,
redirects, form-to-service wiring — is currently untested. Issue #25 puts that
behind a Playwright e2e suite; that suite is deliberately **not** built yet, so
those paths are verified by hand until it lands.
