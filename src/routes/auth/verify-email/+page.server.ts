import { requireUser } from "$lib/server/auth-guards";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  const user = requireUser(locals);
  if (user.emailVerified) {
    redirect(303, "/me");
  }
  return { email: user.email };
}
