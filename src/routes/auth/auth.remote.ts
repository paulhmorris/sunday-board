import { form, getRequestEvent } from "$app/server";
import { EVENTS } from "$lib/analytics/events";
import { Logger } from "$lib/logger";
import { identifyUser, trackEvent } from "$lib/server/analytics";
import { Sentry } from "$lib/sentry";
import { auth } from "$lib/server/auth";
import { delay } from "$lib/utils";
import { invalid, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";

import { signInEmailSchema, signUpEmailSchema } from "./auth.schema";

const logger = new Logger("Auth");

export const signInEmail = form(signInEmailSchema, async (data) => {
  await delay(1000);
  logger.debug("form data", data);
  try {
    const { user } = await auth.api.signInEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedIn, { distinctId: user.id });
  } catch (e) {
    if (isAPIError(e)) {
      logger.warn("Sign in failed", { message: e.message });
      invalid();
    }
    Sentry.captureException(e);
    invalid("Unexpected error");
  }
});

export const signUpEmail = form(signUpEmailSchema, async (data) => {
  try {
    const { user } = await auth.api.signUpEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
    identifyUser(user.id, { email: user.email, name: user.name });
    trackEvent(EVENTS.signedUp, { distinctId: user.id });
  } catch (e) {
    if (isAPIError(e)) {
      logger.warn("Registration failed", { message: e.message });
      invalid("Registration failed");
    }
    Sentry.captureException(e);
    invalid("Unexpected error");
  }
});

export const signOut = form(async () => {
  const { request, locals } = getRequestEvent();
  if (locals.user) trackEvent(EVENTS.signedOut, { distinctId: locals.user.id });
  await auth.api.signOut({ headers: request.headers });
  redirect(303, "/auth/sign-in");
});
