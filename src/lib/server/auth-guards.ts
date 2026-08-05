import { Logger } from "$lib/logger";
import { redirect } from "@sveltejs/kit";

const logger = new Logger("AuthGuard");

/** Redirects to sign-in if there is no authenticated user; otherwise returns the user. */
export function requireUser(locals: App.Locals) {
  if (!locals.user) {
    logger.trace("User is not authenticated, redirecting");
    return redirect(302, "/auth/sign-in");
  }
  return locals.user;
}

/** Redirects home if there is already an authenticated user. */
export function requireGuest(
  locals: App.Locals,
  opts: { status: Parameters<typeof redirect>[0]; location: string } = { status: 302, location: "/" },
) {
  if (locals.user) {
    redirect(opts.status, opts.location);
  }
}
