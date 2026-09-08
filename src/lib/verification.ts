/**
 * The shape of an email verification code, shared because the auth config generates it, the
 * sign-up form validates against it, and the verification screen tells the user about it.
 */
export const VERIFICATION_CODE_LENGTH = 6;

export const VERIFICATION_CODE_EXPIRY_SECONDS = 10 * 60;
