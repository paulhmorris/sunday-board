import { dev } from "$app/env";
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from "$app/env/public";
import type { AnalyticsEvent } from "$lib/analytics/events";
import { type AnalyticsProperties, type AnalyticsProvider, NoopAnalyticsProvider } from "$lib/analytics/types";
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

  reset() {
    // Explicit no-op
  }
}

const provider: AnalyticsProvider =
  !dev && POSTHOG_PROJECT_TOKEN
    ? new PostHogServerProvider(new PostHog(POSTHOG_PROJECT_TOKEN, { host: POSTHOG_HOST }))
    : new NoopAnalyticsProvider();

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  provider.trackEvent(event, properties);
}

export function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
}

export function resetAnalytics() {
  provider.reset();
}
