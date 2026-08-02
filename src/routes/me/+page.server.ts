import { Logger } from "$lib/logger.js";
import { redirect } from "@sveltejs/kit";

const logger = new Logger("Me");

export async function load({ locals }) {
  if (!locals.user) {
    logger.trace("User is not authenticated, redirecting");
    return redirect(302, "/auth/sign-in");
  }
  return { user: locals.user };
}
