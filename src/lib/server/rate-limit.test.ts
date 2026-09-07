import { ErrorReason } from "$lib/server/errors";

import { createRateLimiter } from "./rate-limit";

const start = new Date("2026-09-06T12:00:00Z");
const secondsLater = (seconds: number) => new Date(start.getTime() + seconds * 1000);

describe("createRateLimiter", () => {
  it("allows the first attempts up to the limit", () => {
    const limiter = createRateLimiter({ max: 3, windowSeconds: 60 });

    expect(limiter.check("ada", start).ok).toBe(true);
    expect(limiter.check("ada", secondsLater(1)).ok).toBe(true);
    expect(limiter.check("ada", secondsLater(2)).ok).toBe(true);
  });

  it("refuses the attempt after the limit is reached", () => {
    const limiter = createRateLimiter({ max: 3, windowSeconds: 60 });
    for (const second of [0, 1, 2]) {
      limiter.check("ada", secondsLater(second));
    }

    expect(limiter.check("ada", secondsLater(3))).toStrictEqual({ ok: false, reason: ErrorReason.RateLimited });
  });

  it("does not spend an attempt on a refusal, so hammering cannot extend the block", () => {
    const limiter = createRateLimiter({ max: 1, windowSeconds: 60 });
    limiter.check("ada", start);

    limiter.check("ada", secondsLater(30));

    expect(limiter.check("ada", secondsLater(61)).ok).toBe(true);
  });

  it("allows another attempt once the earliest one falls out of the window", () => {
    const limiter = createRateLimiter({ max: 2, windowSeconds: 60 });
    limiter.check("ada", start);
    limiter.check("ada", secondsLater(30));

    expect(limiter.check("ada", secondsLater(59)).ok).toBe(false);
    expect(limiter.check("ada", secondsLater(61)).ok).toBe(true);
  });

  it("counts each key separately, so one user cannot block another", () => {
    const limiter = createRateLimiter({ max: 1, windowSeconds: 60 });
    limiter.check("ada", start);

    expect(limiter.check("grace", start).ok).toBe(true);
  });
});
