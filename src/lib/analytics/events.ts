// Canonical list of analytics event names. Add new events here rather than
// passing raw strings to trackEvent() at call sites.
export const EVENTS = {
  signedIn: "signed_in",
  signedUp: "signed_up",
  signedOut: "signed_out",
} as const;

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS];
