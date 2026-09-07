import { building, dev } from "$app/env";
import { EMAIL_FROM, RESEND_API_KEY } from "$app/env/private";

import { createFakeTransport } from "./fake";
import type { FakeEmailTransport } from "./fake";
import { createResendTransport } from "./resend";
import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

let transport: EmailTransport;

/** Set only when mail is being captured rather than sent, so dev and tests can read the outbox. */
let fakeTransport: FakeEmailTransport | undefined;

if (RESEND_API_KEY) {
  transport = createResendTransport({ apiKey: RESEND_API_KEY, from: EMAIL_FROM });
} else {
  if (!dev && !building) {
    throw new Error("RESEND_API_KEY is unset — the app cannot deliver email, so it refuses to start");
  }
  fakeTransport = createFakeTransport();
  transport = fakeTransport;
}

export { fakeTransport };

/** The one seam every outbound email goes through. */
export function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  return transport.send(message);
}

export type { EmailMessage, EmailTransport, SendEmailResult } from "./types";
