import { form, getRequestEvent } from "$app/server";
import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";

import { signInEmailSchema, signUpEmailSchema } from "./auth.schema";

const logger = new Logger("Auth");

export const signInEmail = form(signInEmailSchema, async (data) => {
  try {
    await auth.api.signInEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
  } catch (error) {
    if (isAPIError(error)) {
      logger.warn("Sign in failed", { message: error.message });
      return fail(400, { message: "Invalid email or password" });
    }
    Sentry.captureException(error);
    return fail(500, { message: "Unexpected error" });
  }
});

export const signUpEmail = form(signUpEmailSchema, async (data) => {
  try {
    await auth.api.signUpEmail({
      body: { ...data, callbackURL: "/auth/verification-success" },
    });
  } catch (error) {
    if (isAPIError(error)) {
      logger.warn("Registration failed", { message: error.message });
      return fail(400, { message: "Registration failed" });
    }
    Sentry.captureException(error);
    return fail(500, { message: "Unexpected error" });
  }
});

export const signOut = form(async () => {
  const { request } = getRequestEvent();
  await auth.api.signOut({ headers: request.headers });
  redirect(303, "/auth/sign-in");
});
