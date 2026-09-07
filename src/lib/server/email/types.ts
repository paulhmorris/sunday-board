import type { ErrorReason, Result } from "$lib/server/errors";

/** Subject and both bodies of one email, produced by a template in `./templates`. */
export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface EmailMessage extends EmailContent {
  to: string[];
  cc?: string[];
  bcc?: string[];
  idempotencyKey: string;
}

export type SendEmailResult = Result<{ id: string }, typeof ErrorReason.EmailSendFailed>;

export interface EmailTransport {
  send(message: EmailMessage): Promise<SendEmailResult>;
}
