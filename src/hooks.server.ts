import { building, dev } from "$app/env";
import { Logger } from "$lib/logger";
import { auth } from "$lib/server/auth";
import * as Sentry from "@sentry/sveltekit";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

const logger = new Logger("Server");

function errorHandler({ error, event, status }: Parameters<HandleServerError>[0]): App.Error {
  // `handleErrorWithSentry` skips `captureException` for 4xx, so `lastEventId()` would
  // otherwise hand back a stale id from an earlier error.
  const errorId = (status >= 500 ? Sentry.lastEventId() : undefined) ?? crypto.randomUUID();
  logger.error("An error occurred on the server:", { error, errorId, event });

  return { errorId, message: "An error occurred on the server." };
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

  return svelteKitHandler({ auth, building, event, resolve });
};

export const handle = dev
  ? sequence(Sentry.sentryHandle(), devLogger, authHandler)
  : sequence(Sentry.sentryHandle(), authHandler);

function statusColor(status: number) {
  if (status >= 500) {
    return "\x1b[31m";
  } // red
  if (status >= 400) {
    return "\x1b[33m";
  } // yellow
  if (status >= 300) {
    return "\x1b[36m";
  } // cyan
  return "\x1b[32m"; // green
}
