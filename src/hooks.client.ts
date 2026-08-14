import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "$app/env/public";
import { initAnalytics } from "$lib/analytics";
import { Logger } from "$lib/logger";
import * as Sentry from "@sentry/sveltekit";
import type { HandleClientError } from "@sveltejs/kit";

const logger = new Logger("Client");

Sentry.init({
  dsn: SENTRY_DSN,
  enableLogs: true,
  enabled: import.meta.env.PROD,
  environment: SENTRY_ENVIRONMENT,
  tracesSampleRate: 1,
});

initAnalytics();

function errorHandler({ error, event, status }: Parameters<HandleClientError>[0]): App.Error {
  // `handleErrorWithSentry` skips `captureException` for 4xx, so `lastEventId()` would
  // otherwise hand back a stale id from an earlier error.
  const errorId = (status >= 500 ? Sentry.lastEventId() : undefined) ?? crypto.randomUUID();
  logger.error("An error occurred on the client:", { error, errorId, event });

  return { errorId, message: "An error occurred on the client." };
}
export const handleError = Sentry.handleErrorWithSentry(errorHandler);

// set dark mode based on prefers
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}
