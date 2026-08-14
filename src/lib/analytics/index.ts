import { dev } from "$app/env";
import { HOSTNAME, POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from "$app/env/public";
import type { AnalyticsEvent } from "$lib/analytics/events";
import type { AnalyticsProperties, AnalyticsProvider } from "$lib/analytics/types";
import { NoopAnalyticsProvider } from "$lib/analytics/types";
import { Sentry } from "$lib/sentry";
import {
  AnalyticsExtensions,
  FeatureFlagsExtensions,
  SessionReplayExtensions,
} from "posthog-js/dist/extension-bundles";
import posthog from "posthog-js/dist/module.slim";

class PostHogBrowserProvider implements AnalyticsProvider {
  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    posthog.capture(event, properties);
  }

  identify(userId: string, traits?: AnalyticsProperties) {
    posthog.identify(userId, traits);
  }

  reset() {
    posthog.reset();
  }
}

let provider: AnalyticsProvider = new NoopAnalyticsProvider();

function initAnalytics() {
  if (!dev && POSTHOG_PROJECT_TOKEN) {
    posthog.init(POSTHOG_PROJECT_TOKEN, {
      __extensionClasses: {
        ...AnalyticsExtensions,
        ...FeatureFlagsExtensions,
        ...SessionReplayExtensions,
      },
      api_host: POSTHOG_HOST,
      // SvelteKit's client router navigates via history.pushState, which this captures.
      capture_pageleave: true,
      capture_pageview: "history_change",
      defaults: "2026-06-25",
      tracing_headers: [HOSTNAME],
    });
    provider = new PostHogBrowserProvider();
  }
}

function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  provider.trackEvent(event, properties);
}

/**
 * Call at the point a user signs in or signs up — PostHog's guidance is to identify at the
 * auth transition, which also binds the browser's existing anonymous distinct_id to them.
 */
function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
  Sentry.setUser({ id: userId, ...traits });
}

function resetAnalytics() {
  provider.reset();
  Sentry.setUser(null);
}

export { identifyUser, initAnalytics, resetAnalytics, trackEvent };
