import { Logger } from "$lib/logger";
import { Result } from "$lib/server/errors";

import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

const logger = new Logger("FakeEmailTransport");

export interface FakeEmailTransport extends EmailTransport {
  readonly outbox: readonly EmailMessage[];
  clear(): void;
}

/**
 * Captures outbound mail in memory instead of reaching Resend, so tests can read a
 * one-time code and no suite makes a network call. Dedupes on `idempotencyKey` the way
 * Resend does, so a retry is indistinguishable from the real transport.
 */
export function createFakeTransport(): FakeEmailTransport {
  const outbox: EmailMessage[] = [];
  const sent = new Map<string, SendEmailResult>();

  return {
    clear() {
      outbox.length = 0;
      sent.clear();
    },

    outbox,

    send(message) {
      const alreadySent = sent.get(message.idempotencyKey);
      if (alreadySent) {
        return Promise.resolve(alreadySent);
      }

      outbox.push(message);
      const result = Result.ok({ id: `fake-${outbox.length}` });
      sent.set(message.idempotencyKey, result);

      logger.info("Email captured rather than sent", { subject: message.subject });

      return Promise.resolve(result);
    },
  };
}
