import { BETTER_AUTH_SECRET } from "$app/env/private";
import { BETTER_AUTH_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { Logger } from "$lib/logger";
import { db } from "$lib/server/db";
import { sendEmail } from "$lib/server/email";
import { passwordResetEmail, verificationEmail } from "$lib/server/email/templates";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

const COOKIE_AGE = 60 * 60 * 24 * 7;

const logger = new Logger("BetterAuth");

export const auth = betterAuth({
  advanced: {
    cookiePrefix: "sb",
  },
  baseURL: BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Better Auth logs and swallows whatever a mail callback throws, so a failed send cannot
    // fail the request that triggered it. `sendEmail` has already logged it and reported it to
    // Sentry; the user's recourse is to ask for another email.
    sendResetPassword: async ({ token, url, user }) => {
      await sendEmail({
        ...passwordResetEmail({ name: user.name, url }),
        idempotencyKey: `reset-password/${token}`,
        to: user.email,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ token, url, user }) => {
      await sendEmail({
        ...verificationEmail({ name: user.name, url }),
        idempotencyKey: `verify-email/${token}`,
        to: user.email,
      });
    },
  },
  /**
   * Better Auth catches everything its background tasks throw — the mail callbacks among them —
   * and reports it here and nowhere else. Without this it would reach a console and stop there.
   */
  logger: {
    log: (level, message, ...args) => logger[level](message, { args }),
  },
  plugins: [sveltekitCookies(getRequestEvent)],
  secret: BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_AGE,
    },
  },
  user: {
    additionalFields: {
      role: {
        input: false,
        type: "string",
      },
    },
  },
});
