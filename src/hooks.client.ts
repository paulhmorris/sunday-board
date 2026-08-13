import { initAnalytics } from "$lib/analytics";
import * as Sentry from "@sentry/sveltekit";
import type { RequestEvent } from "@sveltejs/kit";

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
  enableLogs: true,
});

initAnalytics();

function errorHandler({ error, event }: { error: unknown; event: RequestEvent }) {
  console.error("An error occurred on the client:", error, event);
}
export const handleError = Sentry.handleErrorWithSentry(errorHandler);

// set dark mode based on prefers
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}
