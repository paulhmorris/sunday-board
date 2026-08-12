import { requireUser } from "$lib/server/auth-guards";

export async function load({ locals }) {
  return { user: requireUser(locals) };
}
