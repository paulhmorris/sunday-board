import { HOSTNAME, POSTHOG_HOST } from "$app/env/public";
import type { AnalyticsEvent } from "$lib/analytics/events";
import type { AnalyticsProperties, AnalyticsProvider } from "$lib/analytics/types";
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

export function createPostHogProvider(token: string): AnalyticsProvider {
  posthog.init(token, {
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
  return new PostHogBrowserProvider();
}
