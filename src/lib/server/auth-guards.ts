import { Logger } from "$lib/logger";
import { redirect } from "@sveltejs/kit";

const logger = new Logger("AuthGuard");

/** Redirects to sign-in if there is no authenticated user; otherwise returns the user. */
export function requireUser(locals: App.Locals) {
  if (!locals.user) {
    logger.debug("User is not authenticated, redirecting");
    return redirect(302, "/auth/sign-in");
  }
  return locals.user;
}

/** Redirects to a specified location if there is already an authenticated user.
 * Defaults to status 302 and location "/".
 */
export function requireGuest(
  locals: App.Locals,
  opts: { status: Parameters<typeof redirect>[0]; location: string } = { location: "/", status: 302 },
) {
  if (locals.user) {
    logger.debug("User is authenticated, redirecting", {
      location: opts.location,
      status: opts.status,
      userId: locals.user.id,
    });
    redirect(opts.status, opts.location);
  }
}
