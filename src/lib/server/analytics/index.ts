import type { AnalyticsEvent } from "$lib/analytics/events";
import { type AnalyticsProperties, type AnalyticsProvider, NoopAnalyticsProvider } from "$lib/analytics/types";
import { Sentry } from "$lib/sentry";
import { dev } from "$app/environment";
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from "$env/static/public";
import { PostHog } from "posthog-node";

class PostHogServerProvider implements AnalyticsProvider {
  constructor(private readonly client: PostHog) {}

  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    const distinctId = (properties?.distinctId as string | undefined) ?? "anonymous";
    this.client.capture({ distinctId, event, properties });
  }

  identify(userId: string, traits?: AnalyticsProperties) {
    this.client.identify({ distinctId: userId, properties: traits });
  }

  pageView(url: string, properties?: AnalyticsProperties) {
    const distinctId = (properties?.distinctId as string | undefined) ?? "anonymous";
    this.client.capture({ distinctId, event: "$pageview", properties: { $current_url: url, ...properties } });
  }

  reset() {
    // No-op: identity is a client-side (cookie/localStorage) concept on posthog-js.
    // Server-side capture calls always take an explicit distinctId per-call instead.
  }
}

const provider: AnalyticsProvider =
  !dev && PUBLIC_POSTHOG_KEY
    ? new PostHogServerProvider(new PostHog(PUBLIC_POSTHOG_KEY, { host: PUBLIC_POSTHOG_HOST }))
    : new NoopAnalyticsProvider();

/**
 * Server-side capture has no persistent browser identity to attach events to,
 * so pass the user id explicitly via `properties.distinctId` (falls back to
 * "anonymous" otherwise).
 */
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
