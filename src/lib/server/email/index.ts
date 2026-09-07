import { RESEND_API_KEY } from "$app/env/private";
import { EMAIL_FROM } from "$app/env/public";
import { Resend } from "resend";

import { createFakeTransport } from "./fake";
import type { FakeEmailTransport } from "./fake";
import { createResendTransport } from "./resend";
import type { EmailMessage, EmailTransport, SendEmailResult } from "./types";

let transport: EmailTransport;

/** Let dev and tests read the outbox. */
let fakeTransport: FakeEmailTransport | undefined;

if (import.meta.env.PROD) {
  transport = createResendTransport({ client: new Resend(RESEND_API_KEY), from: EMAIL_FROM });
} else {
  fakeTransport = createFakeTransport();
  transport = fakeTransport;
}

export { fakeTransport };

export function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  return transport.send(message);
}

export type { EmailContent, EmailMessage, EmailTransport, SendEmailResult } from "./types";
