import { form, getRequestEvent } from "$app/server";
import { EVENTS } from "$lib/analytics/events";
import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { identifyUser, trackEvent } from "$lib/server/analytics";
import { auth } from "$lib/server/auth";
import { requireUser } from "$lib/server/auth-guards";
import { db } from "$lib/server/db";
import { ErrorReason } from "$lib/server/errors";
import { createRateLimiter } from "$lib/server/rate-limit";
import { emailIsTaken } from "$lib/server/services/account";
import { delay } from "$lib/utils";
import { VERIFICATION_RESEND_LIMIT } from "$lib/verification";
import { invalid, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";

import { changeEmailSchema, signInEmailSchema, signUpEmailSchema, verifyEmailSchema } from "./auth.schema";

const logger = new Logger("Auth");

const resendLimiter = createRateLimiter(VERIFICATION_RESEND_LIMIT);

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

/** Every path that mails a code goes through here, so correcting the address is not a way around it. */
function refuseIfRateLimited(userId: string) {
  if (!resendLimiter.check(userId, new Date()).ok) {
    logger.info("Verification code request refused", { reason: ErrorReason.RateLimited, userId });
    invalid("Too many codes requested. Wait a minute, then try again.");
  }
}

/** Returns the user so the client can identify them too — see `identifyUser` in `$lib/analytics`. */
export const signInEmail = form(signInEmailSchema, async (data) => {
  await delay(1000);
  logger.debug("Attempting sign in with email", { email: data.email });
  try {
    const { user } = await auth.api.signInEmail({ body: data });
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
  await delay(1000);
  try {
    const { user } = await auth.api.signUpEmail({ body: data });
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
  const { request } = getRequestEvent();
  try {
    // The headers matter: with the session in context, Better Auth refreshes the cached session
    // cookie, so the guard on the next request sees a verified user rather than bouncing them back.
    await auth.api.verifyEmailOTP({ body: { email: user.email, otp: code }, headers: request.headers });
  } catch (error) {
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
  refuseIfRateLimited(user.id);

  await auth.api.sendVerificationOTP({ body: { email: user.email, type: "email-verification" } });

  return { sentTo: user.email };
});

/**
 * Moves an unverified account to a corrected address. Better Auth updates the address outright and
 * mails the new one a code, so a user stranded at an inbox they cannot read is not stuck.
 */
export const changeVerificationEmail = form(changeEmailSchema, async ({ email }) => {
  const user = requireUnverifiedUser();

  if (await emailIsTaken(db, { email })) {
    invalid("An account already uses that email address. Sign in with it instead.");
  }
  refuseIfRateLimited(user.id);

  const { request } = getRequestEvent();
  try {
    await auth.api.changeEmail({ body: { newEmail: email }, headers: request.headers });
  } catch (error) {
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
  const { request, locals } = getRequestEvent();
  if (locals.user) {
    trackEvent(EVENTS.signedOut, { distinctId: locals.user.id });
  }
  await auth.api.signOut({ headers: request.headers });
  redirect(303, "/auth/sign-in");
});
