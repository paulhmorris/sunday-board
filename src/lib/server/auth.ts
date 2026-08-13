import { BETTER_AUTH_SECRET } from "$app/env/private";
import { BETTER_AUTH_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  plugins: [
    sveltekitCookies(getRequestEvent), // make sure this is the last plugin in the array
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "sb",
  },
  emailAndPassword: {
    enabled: true,
  },
  // TODO: Facebook login
  // socialProviders: {
  //   facebook: {
  //     clientId: process.env.FACEBOOK_CLIENT_ID,
  //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  //   }
  // }
});
