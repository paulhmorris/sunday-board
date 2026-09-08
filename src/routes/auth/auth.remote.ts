import { form, getRequestEvent } from "$app/server";
import { EVENTS } from "$lib/analytics/events";
import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { identifyUser, trackEvent } from "$lib/server/analytics";
import { auth } from "$lib/server/auth";
import { callAuthEndpoint } from "$lib/server/auth-endpoint";
import { requireUser } from "$lib/server/auth-guards";
import { invalid, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";

import { changeEmailSchema, signInEmailSchema, signUpEmailSchema, verifyEmailSchema } from "./auth.schema";

const logger = new Logger("Auth");

/** The one surface an unverified account may use, so every function here resolves its own user. */
function requireUnverifiedUser() {
  const { locals } = getRequestEvent();
  const user = requireUser(locals);
  if (user.emailVerified) {
    redirect(303, "/me");
  }
  return user;
}

/** Better Auth's copy for a refused code, mapped to ours. Anything else is a wrong code. */
const CODE_REFUSALS: Record<string, string> = {
  OTP_EXPIRED: "That code has expired. Send yourself a new one.",
  TOO_MANY_ATTEMPTS: "Too many wrong codes. Send yourself a new one.",
};

/**
 * The router refuses with a 429 before the endpoint runs, so this comes back with no error code and
 * has to be recognised ahead of whatever the endpoint itself would have said.
 */
function refuseIfRateLimited(error: unknown) {
  if (isAPIError(error) && error.statusCode === 429) {
    logger.info("Auth request refused by rate limit");
    invalid("Too many attempts. Wait a minute, then try again.");
  }
}

/** Returns the user so the client can identify them too — see `identifyUser` in `$lib/analytics`. */
export const signInEmail = form(signInEmailSchema, async (data) => {
  logger.debug("Attempting sign in with email", { email: data.email });
  try {
    const { user } = await callAuthEndpoint(auth.api.signInEmail, data);
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedIn, { distinctId: user.id });
    logger.debug("Sign in successful", { email: user.email });
    return {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    };
  } catch (error) {
    refuseIfRateLimited(error);
    logger.debug("Sign in failed", { error });
    if (isAPIError(error)) {
      logger.warn("Sign in failed", { message: error.message });
      invalid("Invalid email or password");
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }
});

/** Returns the user so the client can identify them too — see `identifyUser` in `$lib/analytics`. */
export const signUpEmail = form(signUpEmailSchema, async (data) => {
  try {
    const { user } = await callAuthEndpoint(auth.api.signUpEmail, data);
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedUp, { distinctId: user.id });
    return {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    };
  } catch (error) {
    refuseIfRateLimited(error);
    if (isAPIError(error)) {
      logger.warn("Registration failed", { code: error.body?.code });
      if (error.body?.code?.startsWith("USER_ALREADY_EXISTS")) {
        invalid("An account already uses that email address. Sign in instead.");
      }
      invalid("Registration failed");
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }
});

/** Proves the address on the account. The address comes from the session, never from the form. */
export const verifyEmail = form(verifyEmailSchema, async ({ code }) => {
  const user = requireUnverifiedUser();
  try {
    // The session travels with the call, so Better Auth refreshes the cached session cookie and the
    // guard on the next request sees a verified user rather than bouncing them back.
    await callAuthEndpoint(auth.api.verifyEmailOTP, { email: user.email, otp: code });
  } catch (error) {
    refuseIfRateLimited(error);
    if (isAPIError(error)) {
      logger.info("Verification refused", { code: error.body?.code, userId: user.id });
      invalid(CODE_REFUSALS[error.body?.code ?? ""] ?? "That code isn't right. Check it and try again.");
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }

  trackEvent(EVENTS.emailVerified, { distinctId: user.id });
  logger.info("Email verified", { userId: user.id });

  redirect(303, "/me");
});

export const resendVerificationCode = form(async () => {
  const user = requireUnverifiedUser();

  try {
    await callAuthEndpoint(auth.api.sendVerificationOTP, { email: user.email, type: "email-verification" });
  } catch (error) {
    refuseIfRateLimited(error);
    Sentry.captureException(error);
    invalid("We couldn't send a new code. Try again in a moment.");
  }

  return { sentTo: user.email };
});

/**
 * Moves an unverified account to a corrected address. Better Auth updates the address outright and
 * mails the new one a code, so a user stranded at an inbox they cannot read is not stuck.
 *
 * An address that already has an account is answered exactly like one that does not, and no mail
 * is sent — Better Auth's own behaviour, kept so this screen cannot be used to enumerate accounts.
 */
export const changeVerificationEmail = form(changeEmailSchema, async ({ email }) => {
  const user = requireUnverifiedUser();

  try {
    await callAuthEndpoint(auth.api.changeEmail, { newEmail: email });
  } catch (error) {
    refuseIfRateLimited(error);
    if (isAPIError(error)) {
      logger.warn("Email correction failed", { code: error.body?.code, userId: user.id });
      invalid("We couldn't change your email address. Check it and try again.");
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }

  logger.info("Unverified account moved to a corrected address", { userId: user.id });

  return { sentTo: email };
});

export const signOut = form(async () => {
  const { locals } = getRequestEvent();
  if (locals.user) {
    trackEvent(EVENTS.signedOut, { distinctId: locals.user.id });
  }
  await callAuthEndpoint(auth.api.signOut);
  redirect(303, "/auth/sign-in");
});
