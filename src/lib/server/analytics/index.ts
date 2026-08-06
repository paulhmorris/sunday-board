import type { AnalyticsEvent } from "$lib/analytics/events";
import { type AnalyticsProperties, type AnalyticsProvider, NoopAnalyticsProvider } from "$lib/analytics/types";
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

/**
 * Deliberately does NOT call `Sentry.setUser()` here, unlike the client
 * version. `Sentry.setUser()` writes to the current isolation scope, which is
 * only request-scoped if Sentry's Node auto-instrumentation has correctly set
 * up per-request AsyncLocalStorage isolation for every path that can reach
 * this function — not something to gamble a shared Node process on. PostHog's
 * `identify()` is safe to call here because it's a stateless, one-shot event
 * carrying an explicit distinctId; the shared client holds no per-request
 * "current user" state.
 */
export function identifyUser(userId: string, traits?: AnalyticsProperties) {
  provider.identify(userId, traits);
}

export function resetAnalytics() {
  provider.reset();
}
