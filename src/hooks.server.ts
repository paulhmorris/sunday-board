import { building, dev } from "$app/environment";
import { auth } from "$lib/server/auth";
import * as Sentry from "@sentry/sveltekit";
import type { Handle, RequestEvent } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

function errorHandler({ error, event }: { error: unknown; event: RequestEvent }) {
  console.error("An error occurred on the server:", error, event);
}

export const handleError = Sentry.handleErrorWithSentry(errorHandler);

const devLogger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  console.log(
    `${"\x1b[2m"}${new Date().toISOString()}${"\x1b[0m"} ${event.request.method} ${event.url.pathname} ${statusColor(response.status)}${response.status}${"\x1b[0m"} ${"\x1b[2m"}(${duration}ms)${"\x1b[0m"}`,
  );

  return response;
};

const authHandler: Handle = async ({ event, resolve }) => {
  // Fetch current session from Better Auth
  const session = await auth.api.getSession({ headers: event.request.headers });

  // Make session and user available on server
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = dev
  ? sequence(Sentry.sentryHandle(), devLogger, authHandler)
  : sequence(Sentry.sentryHandle(), authHandler);

function statusColor(status: number) {
  if (status >= 500) return "\x1b[31m"; // red
  if (status >= 400) return "\x1b[33m"; // yellow
  if (status >= 300) return "\x1b[36m"; // cyan
  return "\x1b[32m"; // green
}
