/**
 * The app-wide dictionary of failure reasons a caller branches on. Enables exhaustive switch.
 */
export const ErrorReason = {
  AccountNotFound: "account_not_found",
} as const;

export type ErrorReason = (typeof ErrorReason)[keyof typeof ErrorReason];

export type Result<T, R extends ErrorReason = ErrorReason> = { ok: true; data: T } | { ok: false; reason: R };

/**
 * Constructors, namespaced under the type's own name — `ok` and `fail` are taken as
 * bare identifiers by better-auth and `@sveltejs/kit` respectively.
 */
export const Result = {
  fail<R extends ErrorReason>(reason: R): Result<never, R> {
    return { ok: false, reason };
  },

  ok<T>(data: T): Result<T, never> {
    return { data, ok: true };
  },
};
