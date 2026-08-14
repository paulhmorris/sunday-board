import { dev } from "$app/env";
import { POSTHOG_PROJECT_TOKEN } from "$app/env/public";
import type { AnalyticsEvent } from "$lib/analytics/events";
import type { AnalyticsProperties, AnalyticsProvider } from "$lib/analytics/types";
import { NoopAnalyticsProvider } from "$lib/analytics/types";

let provider: AnalyticsProvider = new NoopAnalyticsProvider();

/**
 * `$lib/analytics/posthog` is imported dynamically so posthog-js and its extension bundles
 * (session replay, feature flags) only enter the bundle when analytics actually runs —
 * a static import dragged them into every dev build, including SSR-only requests.
 */
async function initAnalytics() {
  if (dev || !POSTHOG_PROJECT_TOKEN) {
    return;
  }

  const { createPostHogProvider } = await import("$lib/analytics/posthog");
  provider = createPostHogProvider(POSTHOG_PROJECT_TOKEN);
}

function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  provider.trackEvent(event, properties);
}

async function setSentryUser(user: ({ id: string } & AnalyticsProperties) | null) {
  if (dev) {
    return;
  }
  const { Sentry } = await import("$lib/sentry");
  Sentry.setUser(user);
}

/**
 * Call at the point a user signs in or signs up — PostHog's guidance is to identify at the
 * auth transition, which also binds the browser's existing anonymous distinct_id to them.
 */
async function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
  await setSentryUser({ id: userId, ...traits });
}

async function resetAnalytics() {
  provider.reset();
  await setSentryUser(null);
}

export { identifyUser, initAnalytics, resetAnalytics, trackEvent };
