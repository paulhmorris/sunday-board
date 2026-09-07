import { ErrorReason } from "$lib/server/errors";

import { createResendTransport } from "./resend";
import type { EmailMessage } from "./types";

const message: EmailMessage = {
  html: "<p>Hello</p>",
  idempotencyKey: "verify-email/token-1",
  subject: "Verify your email",
  text: "Hello",
  to: "musician@example.com",
};

function transportWith(fetch: typeof globalThis.fetch) {
  return createResendTransport({ apiKey: "re_test", fetch, from: "Sunday Board <hello@example.com>" });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, status });
}

describe("createResendTransport", () => {
  it("posts the message to Resend and returns the id it assigned", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse({ id: "email-1" }));

    const result = await transportWith(fetch).send(message);

    expect(result).toStrictEqual({ data: { id: "email-1" }, ok: true });

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toStrictEqual({
      from: "Sunday Board <hello@example.com>",
      html: "<p>Hello</p>",
      subject: "Verify your email",
      text: "Hello",
      to: "musician@example.com",
    });
  });

  it("authenticates and sends the message's idempotency key so a retry cannot deliver twice", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse({ id: "email-1" }));

    await transportWith(fetch).send(message);

    expect(new Headers(fetch.mock.calls[0]![1]?.headers).get("authorization")).toBe("Bearer re_test");
    expect(new Headers(fetch.mock.calls[0]![1]?.headers).get("idempotency-key")).toBe("verify-email/token-1");
  });

  it("fails with a reason rather than throwing when Resend rejects the send", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(jsonResponse({ message: "Invalid `from` field", name: "validation_error" }, 422));

    const result = await transportWith(fetch).send(message);

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.EmailSendFailed });
  });

  it("fails with a reason rather than throwing when the request never reaches Resend", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error("ECONNRESET"));

    const result = await transportWith(fetch).send(message);

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.EmailSendFailed });
  });
});
