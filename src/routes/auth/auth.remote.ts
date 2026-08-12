import { form, getRequestEvent } from "$app/server";
import { EVENTS } from "$lib/analytics/events";
import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { identifyUser, trackEvent } from "$lib/server/analytics";
import { auth } from "$lib/server/auth";
import { delay } from "$lib/utils";
import { invalid, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";

import { signInEmailSchema, signUpEmailSchema } from "./auth.schema";

const logger = new Logger("Auth");

/** Returns the user so the client can identify them too — see `identifyUser` in `$lib/analytics`. */
export const signInEmail = form(signInEmailSchema, async (data) => {
  await delay(1000);
  try {
    const { user } = await auth.api.signInEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedIn, { distinctId: user.id });
    return { user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    if (isAPIError(error)) {
      logger.warn("Sign in failed", { message: error.message });
      invalid();
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }
});

/** Returns the user so the client can identify them too — see `identifyUser` in `$lib/analytics`. */
export const signUpEmail = form(signUpEmailSchema, async (data) => {
  await delay(1000);
  try {
    const { user } = await auth.api.signUpEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedUp, { distinctId: user.id });
    return { user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    if (isAPIError(error)) {
      logger.warn("Registration failed", { message: error.message });
      invalid("Registration failed");
    }
    Sentry.captureException(error);
    invalid("Unexpected error");
  }
});

export const signOut = form(async () => {
  const { request, locals } = getRequestEvent();
  if (locals.user) trackEvent(EVENTS.signedOut, { distinctId: locals.user.id });
  await auth.api.signOut({ headers: request.headers });
  redirect(303, "/auth/sign-in");
});
