import { ErrorReason, Result } from "$lib/server/errors";

interface RateLimiterOptions {
  /** Attempts allowed within one window. */
  max: number;
  windowSeconds: number;
}

export type RateLimitResult = Result<{ remaining: number }, typeof ErrorReason.RateLimited>;

export interface RateLimiter {
  /** Records an attempt and says whether it is allowed. A refusal is not itself an attempt. */
  check(key: string, now: Date): RateLimitResult;
}

/**
 * Sliding-window counter held in this process's memory, which is where Better Auth keeps its own.
 * A second app instance would therefore double the effective limit — good enough for a limit whose
 * job is to stop one inbox being mail-bombed, not to be an exact quota.
 */
export function createRateLimiter({ max, windowSeconds }: RateLimiterOptions): RateLimiter {
  const attempts = new Map<string, number[]>();

  return {
    check(key, now) {
      const cutoff = now.getTime() - windowSeconds * 1000;
      const recent = (attempts.get(key) ?? []).filter((at) => at > cutoff);

      if (recent.length >= max) {
        attempts.set(key, recent);
        return Result.fail(ErrorReason.RateLimited);
      }

      recent.push(now.getTime());
      attempts.set(key, recent);
      evictIdleKeys(attempts, cutoff);

      return Result.ok({ remaining: max - recent.length });
    },
  };
}

/** Keys are user ids, so without this the map would grow for the life of the process. */
function evictIdleKeys(attempts: Map<string, number[]>, cutoff: number) {
  for (const [key, times] of attempts) {
    if (times.every((at) => at <= cutoff)) {
      attempts.delete(key);
    }
  }
}
