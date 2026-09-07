import type { ErrorReason, Result } from "$lib/server/errors";

/** Subject and both bodies of one email, produced by a template in `./templates`. */
export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface EmailMessage extends EmailContent {
  to: string;
  /**
   * Sent to Resend as `Idempotency-Key`, which dedupes identical payloads for 24 hours.
   * Derive it from the thing being sent (`verify-email/<token>`) so a retry is suppressed
   * but a freshly requested email is not. Treat it as a secret — it embeds a one-time
   * token, so it is never logged.
   */
  idempotencyKey: string;
}

export type SendEmailResult = Result<{ id: string }, typeof ErrorReason.EmailSendFailed>;

export interface EmailTransport {
  send(message: EmailMessage): Promise<SendEmailResult>;
}
