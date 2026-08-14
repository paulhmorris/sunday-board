import { BETTER_AUTH_SECRET } from "$app/env/private";
import { BETTER_AUTH_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
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
