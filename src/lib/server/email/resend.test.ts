import { ErrorReason } from "$lib/server/errors";
import type { Resend } from "resend";
import { mockDeep } from "vitest-mock-extended";
import type { DeepMockProxy } from "vitest-mock-extended";

import { createResendTransport } from "./resend";
import type { EmailMessage } from "./types";

const message: EmailMessage = {
  html: "<p>Hello</p>",
  idempotencyKey: "verify-email/token-1",
  subject: "Verify your email",
  text: "Hello",
  to: ["musician@example.com"],
};

function transportWith(client: DeepMockProxy<Resend>) {
  return createResendTransport({ client, from: "Sunday Board <hello@example.com>" });
}

function mockResend() {
  return mockDeep<Resend>();
}

describe("createResendTransport", () => {
  it("sends the message through Resend and returns the id it assigned", async () => {
    const client = mockResend();
    client.emails.send.mockResolvedValue({ data: { id: "email-1" }, error: null, headers: null });

    const result = await transportWith(client).send(message);

    expect(result).toStrictEqual({ data: { id: "email-1" }, ok: true });
    expect(client.emails.send).toHaveBeenCalledWith(
      {
        bcc: undefined,
        cc: undefined,
        from: "Sunday Board <hello@example.com>",
        html: "<p>Hello</p>",
        subject: "Verify your email",
        text: "Hello",
        to: ["musician@example.com"],
      },
      { idempotencyKey: "verify-email/token-1" },
    );
  });

  it("passes every recipient list through so cc and bcc reach the provider", async () => {
    const client = mockResend();
    client.emails.send.mockResolvedValue({ data: { id: "email-1" }, error: null, headers: null });

    await transportWith(client).send({
      ...message,
      bcc: ["archive@example.com"],
      cc: ["manager@example.com", "agent@example.com"],
      to: ["musician@example.com", "drummer@example.com"],
    });

    expect(client.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        bcc: ["archive@example.com"],
        cc: ["manager@example.com", "agent@example.com"],
        to: ["musician@example.com", "drummer@example.com"],
      }),
      expect.anything(),
    );
  });

  it("fails with a reason rather than throwing when Resend rejects the send", async () => {
    const client = mockResend();
    client.emails.send.mockResolvedValue({
      data: null,
      error: { message: "Invalid `from` field", name: "validation_error", statusCode: 422 },
      headers: null,
    });

    const result = await transportWith(client).send(message);

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.EmailSendFailed });
  });

  it("fails with a reason rather than throwing when the send throws outright", async () => {
    const client = mockResend();
    client.emails.send.mockRejectedValue(new Error("ECONNRESET"));

    const result = await transportWith(client).send(message);

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.EmailSendFailed });
  });
});
