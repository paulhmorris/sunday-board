import { NoopAnalyticsProvider } from "./types";

describe("NoopAnalyticsProvider", () => {
  it("implements every AnalyticsProvider method as a no-op that never throws", () => {
    const provider = new NoopAnalyticsProvider();

    expect(() => provider.trackEvent("signed_in", { foo: "bar" })).not.toThrow();
    expect(() => provider.identify("user-1", { email: "a@b.com" })).not.toThrow();
    expect(() => provider.reset()).not.toThrow();
  });
});
