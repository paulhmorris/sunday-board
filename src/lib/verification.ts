/**
 * The shape of an email verification code, shared because the auth config generates it, the
 * sign-up form validates against it, and the verification screen tells the user about it.
 */
export const VERIFICATION_CODE_LENGTH = 6;

export const VERIFICATION_CODE_EXPIRY_SECONDS = 10 * 60;

/**
 * How many codes one account may be mailed per minute. Better Auth's own rate limiting only runs
 * for requests through its HTTP handler, and we call `auth.api` directly, so the resend limiter in
 * `auth.remote` is what actually enforces this.
 */
export const VERIFICATION_RESEND_LIMIT = { max: 3, windowSeconds: 60 };
