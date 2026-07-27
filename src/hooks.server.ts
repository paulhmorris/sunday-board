import * as Sentry from "@sentry/sveltekit";
import type { RequestEvent } from "@sveltejs/kit";

function errorHandler({ error, event }: { error: unknown; event: RequestEvent }) {
  console.error("An error occurred on the server:", error, event);
}

export const handleError = Sentry.handleErrorWithSentry(errorHandler);
export const handle = Sentry.sentryHandle();
