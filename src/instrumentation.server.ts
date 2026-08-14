import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "$app/env/public";
import { tagModule } from "$lib/sentry";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  beforeSend: tagModule,
  dsn: SENTRY_DSN,
  enableLogs: true,
  enabled: import.meta.env.PROD,
  environment: SENTRY_ENVIRONMENT,
  tracesSampleRate: 1,
});
