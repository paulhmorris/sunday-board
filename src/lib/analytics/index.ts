import type { AnalyticsEvent } from "$lib/analytics/events";
import { type AnalyticsProperties, type AnalyticsProvider, NoopAnalyticsProvider } from "$lib/analytics/types";
import { Sentry } from "$lib/sentry";
import { dev } from "$app/environment";
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from "$env/static/public";
import posthog from "posthog-js";

class PostHogBrowserProvider implements AnalyticsProvider {
  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    posthog.capture(event, properties);
  }

  identify(userId: string, traits?: AnalyticsProperties) {
    posthog.identify(userId, traits);
  }

  pageView(url: string, properties?: AnalyticsProperties) {
    posthog.capture("$pageview", { $current_url: url, ...properties });
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
      capture_pageview: false, // we call trackPageView() manually on SvelteKit navigation
      capture_pageleave: true,
    });
    provider = new PostHogBrowserProvider();
  }
}

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  provider.trackEvent(event, properties);
}

export function trackPageView(url: string, properties?: AnalyticsProperties) {
  provider.pageView(url, properties);
}

export function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
  Sentry.setUser({ id: userId, ...traits });
}

export function resetAnalytics() {
  provider.reset();
  Sentry.setUser(null);
}
