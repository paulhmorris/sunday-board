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

/**
 * Redirects to sign-in if there is no authenticated user, and to verification if there is one who
 * has not proved their email address. Email verification is the phase's only identity check, so
 * every signed-in surface goes through this rather than `requireUser`.
 */
export function requireVerifiedUser(locals: App.Locals) {
  const user = requireUser(locals);
  if (!user.emailVerified) {
    logger.debug("User has not verified their email, redirecting", { userId: user.id });
    redirect(302, "/auth/verify-email");
  }
  return user;
}

/** Redirects if there is already an authenticated user. Defaults to status 302.
 *
 * With no location, an unverified user goes to verification rather than "/" — which is what a
 * sign-up submitted without JavaScript relies on to reach the verification screen at all.
 */
export function requireGuest(
  locals: App.Locals,
  opts: { status?: Parameters<typeof redirect>[0]; location?: string } = {},
) {
  if (locals.user) {
    const status = opts.status ?? 302;
    const location = opts.location ?? (locals.user.emailVerified ? "/" : "/auth/verify-email");
    logger.debug("User is authenticated, redirecting", { location, status, userId: locals.user.id });
    redirect(status, location);
  }
}
