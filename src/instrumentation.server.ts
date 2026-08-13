import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "$app/env/public";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,

  tracesSampleRate: 1.0,
  enableLogs: true,
});
