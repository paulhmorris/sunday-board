import { describe, expect, it } from "vitest";

import { identifyUser, resetAnalytics, trackEvent } from "./index";

// Tests run outside a production build, so the module falls back to
// NoopAnalyticsProvider and never touches the network.
describe("server analytics (dev/test fallback)", () => {
  it("trackEvent does not throw without a distinctId", () => {
    expect(() => trackEvent("signed_in")).not.toThrow();
  });

  it("identifyUser does not throw and does not require PostHog config", () => {
    expect(() => identifyUser("user-1", { email: "a@b.com" })).not.toThrow();
  });

  it("resetAnalytics does not throw", () => {
    expect(() => resetAnalytics()).not.toThrow();
  });
});
