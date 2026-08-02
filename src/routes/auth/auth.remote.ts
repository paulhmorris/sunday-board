import { form, getRequestEvent } from "$app/server";
import { Logger } from "$lib/logger";
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
    await auth.api.signInEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
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
    await auth.api.signUpEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
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
  const { request } = getRequestEvent();
  await auth.api.signOut({ headers: request.headers });
  redirect(303, "/auth/sign-in");
});
