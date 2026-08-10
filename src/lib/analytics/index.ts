import { dev } from "$app/environment";
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from "$env/static/public";
import type { AnalyticsEvent } from "$lib/analytics/events";
import { type AnalyticsProperties, type AnalyticsProvider, NoopAnalyticsProvider } from "$lib/analytics/types";
import { Sentry } from "$lib/sentry";
import posthog from "posthog-js";

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

export function initAnalytics() {
  if (!dev && PUBLIC_POSTHOG_KEY) {
    posthog.init(PUBLIC_POSTHOG_KEY, {
      api_host: PUBLIC_POSTHOG_HOST,
      // SvelteKit's client router navigates via history.pushState, which this captures.
      capture_pageview: "history_change",
      capture_pageleave: true,
    });
    provider = new PostHogBrowserProvider();
  }
}

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  provider.trackEvent(event, properties);
}

/**
 * Call at the point a user signs in or signs up — PostHog's guidance is to identify at the
 * auth transition, which also binds the browser's existing anonymous distinct_id to them.
 */
export function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
  Sentry.setUser({ id: userId, ...traits });
}

export function resetAnalytics() {
  provider.reset();
  Sentry.setUser(null);
}
