import { Logger } from "$lib/logger";
import { Result } from "$lib/server/errors";

import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

const logger = new Logger("FakeEmailTransport");

export interface FakeEmailTransport extends EmailTransport {
  readonly outbox: readonly EmailMessage[];
  clear(): void;
}

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
