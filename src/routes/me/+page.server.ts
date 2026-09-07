import { requireVerifiedUser } from "$lib/server/auth-guards";

export async function load({ locals }) {
  return { user: requireVerifiedUser(locals) };
}
