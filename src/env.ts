import { defineEnvVars } from "@sveltejs/kit/env";
import * as v from "valibot";

const nonEmptyString = v.pipe(v.string(), v.nonEmpty());
const url = v.pipe(v.string(), v.url());

export const variables = defineEnvVars({
  // Private
  DIRECT_URL: { schema: url, description: "Non-pooled Postgres connection string, used for migrations." },
  DATABASE_URL: { schema: url, description: "Pooled Postgres connection string, used at runtime." },

  SENTRY_ORG: { schema: nonEmptyString, description: "Sentry organization slug, used for sourcemap uploads." },
  SENTRY_PROJECT: { schema: nonEmptyString, description: "Sentry project slug, used for sourcemap uploads." },
  SENTRY_AUTH_TOKEN: {
    schema: nonEmptyString,
    description: "Sentry auth token for uploading sourcemaps at build time.",
  },

  BETTER_AUTH_SECRET: {
    schema: nonEmptyString,
    description: "Secret key used to sign and encrypt Better Auth sessions and tokens.",
  },

  // Public
  HOSTNAME: { public: true, schema: url, description: "Hostname of the deployment." },
  BETTER_AUTH_URL: {
    public: true,
    schema: url,
    description: "Base URL of the app, used by Better Auth for callbacks and redirects.",
  },

  SENTRY_DSN: { public: true, schema: url, description: "Sentry DSN for error reporting." },
  SENTRY_ENVIRONMENT: {
    public: true,
    static: true,
    schema: nonEmptyString,
    description: "Environment name reported to client-side Sentry.",
  },

  POSTHOG_PROJECT_TOKEN: {
    public: true,
    static: true,
    schema: url,
    description: "PostHog ingestion host used by the client SDK.",
  },
  POSTHOG_HOST: {
    public: true,
    static: true,
    schema: url,
    description: "PostHog ingestion host used by the SDK.",
  },
});
