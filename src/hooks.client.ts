import * as Sentry from "@sentry/sveltekit";
import type { RequestEvent } from "@sveltejs/kit";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
  enableLogs: true,
});

function errorHandler({ error, event }: { error: unknown; event: RequestEvent }) {
  console.error("An error occurred on the client:", error, event);
}
export const handleError = Sentry.handleErrorWithSentry(errorHandler);
