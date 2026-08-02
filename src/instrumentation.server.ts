import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE,
  environment: process.env.SENTRY_ENVIRONMENT,

  tracesSampleRate: 1.0,
  enableLogs: true,
});
