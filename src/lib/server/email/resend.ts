import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { ErrorReason, Result } from "$lib/server/errors";

import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

const logger = new Logger("ResendTransport");

const ENDPOINT = "https://api.resend.com/emails";

interface ResendTransportConfig {
  apiKey: string;
  /** Sender address on a domain verified in Resend, e.g. `Sunday Board <hello@sundayboard.com>`. */
  from: string;
  fetch?: typeof globalThis.fetch;
}

export function createResendTransport(config: ResendTransportConfig): EmailTransport {
  const fetch = config.fetch ?? globalThis.fetch;

  return {
    async send(message) {
      try {
        const response = await fetch(ENDPOINT, {
          body: JSON.stringify({
            from: config.from,
            html: message.html,
            subject: message.subject,
            text: message.text,
            to: message.to,
          }),
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": message.idempotencyKey,
          },
          method: "POST",
        });

        if (!response.ok) {
          return report(
            message,
            new Error(`Resend rejected the send with ${response.status}: ${await response.text()}`),
          );
        }

        const { id } = (await response.json()) as { id: string };
        logger.info("Email sent", { id, subject: message.subject });

        return Result.ok({ id });
      } catch (error) {
        return report(message, error);
      }
    },
  };
}

/**
 * A failed send never reaches `handleError`, so this is its one reporting site — the caller
 * gets a reason to map to copy, and the operator gets the cause.
 */
function report(message: EmailMessage, error: unknown): SendEmailResult {
  logger.error("Email send failed", { error, subject: message.subject });
  Sentry.captureException(error);

  return Result.fail(ErrorReason.EmailSendFailed);
}
