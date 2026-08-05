import { requireGuest } from "$lib/server/auth-guards";

export async function load({ locals }) {
  requireGuest(locals);
}
