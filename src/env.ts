import { defineEnvVars } from "@sveltejs/kit/env";
import * as v from "valibot";

const nonEmptyString = v.pipe(v.string(), v.nonEmpty());
const url = v.pipe(v.string(), v.url());

export const variables = defineEnvVars({
  // Private
  DIRECT_URL: { description: "Non-pooled Postgres connection string, used for migrations.", schema: url },
  DATABASE_URL: { description: "Pooled Postgres connection string, used at runtime.", schema: url },

  SENTRY_ORG: {
    description: "Sentry organization slug, used for sourcemap uploads.",
    schema: nonEmptyString,
    static: true,
  },
  SENTRY_PROJECT: {
    description: "Sentry project slug, used for sourcemap uploads.",
    schema: nonEmptyString,
    static: true,
  },
  /*
   * SENTRY_AUTH_TOKEN is deliberately absent: sentry-cli reads it from the environment itself, so
   * declaring it here only forces every build — CI included — to hold a credential it never uses.
   * Without one the plugin warns and skips the upload.
   */

  BETTER_AUTH_SECRET: {
    description: "Secret key used to sign and encrypt Better Auth sessions and tokens.",
    schema: nonEmptyString,
  },

  // Public
  HOSTNAME: { description: "Hostname of the deployment.", public: true, schema: nonEmptyString },
  BETTER_AUTH_URL: {
    description: "Base URL of the app, used by Better Auth for callbacks and redirects.",
    public: true,
    schema: url,
    static: true,
  },

  SENTRY_DSN: {
    description: "Sentry DSN for error reporting.",
    public: true,
    schema: url,
    static: true,
  },
  SENTRY_ENVIRONMENT: {
    description: "Environment name reported to client-side Sentry.",
    public: true,
    schema: nonEmptyString,
    static: true,
  },

  POSTHOG_PROJECT_TOKEN: {
    description: "PostHog ingestion host used by the client SDK.",
    public: true,
    schema: nonEmptyString,
    static: true,
  },
  POSTHOG_HOST: {
    description: "PostHog ingestion host used by the SDK.",
    public: true,
    schema: url,
    static: true,
  },
});
