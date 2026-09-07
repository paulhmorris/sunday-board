import { Logger } from "$lib/logger";
import { Sentry } from "$lib/sentry";
import { ErrorReason, Result } from "$lib/server/errors";
import type { Resend } from "resend";

import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

const logger = new Logger("ResendTransport");

interface ResendTransportConfig {
  client: Resend;
  from: string;
}

export function createResendTransport({ client, from }: ResendTransportConfig): EmailTransport {
  return {
    async send(message) {
      try {
        const { idempotencyKey, ...rest } = message;
        const { data, error } = await client.emails.send({ ...rest, from }, { idempotencyKey });

        if (error) {
          return report(message, new Error(`Resend rejected the send: ${error.name} — ${error.message}`));
        }

        logger.info("Email sent", { id: data.id, subject: message.subject });

        return Result.ok({ id: data.id });
      } catch (error) {
        return report(message, error);
      }
    },
  };
}

function report(message: EmailMessage, error: unknown): SendEmailResult {
  logger.error("Email send failed", { error, subject: message.subject });
  Sentry.captureException(error);

  return Result.fail(ErrorReason.EmailSendFailed);
}
