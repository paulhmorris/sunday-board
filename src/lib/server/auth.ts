import { BETTER_AUTH_SECRET } from "$app/env/private";
import { BETTER_AUTH_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { createAuth } from "$lib/server/auth-config";
import { db } from "$lib/server/db";
import { sendEmail } from "$lib/server/email";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = createAuth({
  baseURL: BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  getRequestEvent,
  secret: BETTER_AUTH_SECRET,
  sendEmail,
});
