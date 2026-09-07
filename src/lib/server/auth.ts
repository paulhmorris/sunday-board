import { BETTER_AUTH_SECRET } from "$app/env/private";
import { BETTER_AUTH_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { sendEmail } from "$lib/server/email";
import { passwordResetEmail, verificationEmail } from "$lib/server/email/templates";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

const COOKIE_AGE = 60 * 60 * 24 * 7;

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
