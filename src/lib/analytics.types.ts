import type { AnalyticsEvent } from "$lib/analytics-events";

// Zero-dependency module: safe to import from both client and server code
// without dragging posthog-js or posthog-node into the wrong bundle.

export type AnalyticsProperties = Record<string, unknown>;

export interface AnalyticsProvider {
  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): void;
  identify(userId: string, traits?: AnalyticsProperties): void;
  pageView(url: string, properties?: AnalyticsProperties): void;
  reset(): void; // real on the client; server implementations may no-op
}

export class NoopAnalyticsProvider implements AnalyticsProvider {
  trackEvent(_event: AnalyticsEvent, _properties?: AnalyticsProperties) {}
  identify(_userId: string, _traits?: AnalyticsProperties) {}
  pageView(_url: string, _properties?: AnalyticsProperties) {}
  reset() {}
}
