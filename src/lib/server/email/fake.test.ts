import { createFakeTransport } from "./fake";
import type { EmailMessage } from "./types";

const message: EmailMessage = {
  html: "<p>Hello</p>",
  idempotencyKey: "verify-email/token-1",
  subject: "Verify your email",
  text: "Hello",
  to: "musician@example.com",
};

describe("createFakeTransport", () => {
  it("captures what would have been sent instead of reaching a vendor", async () => {
    const transport = createFakeTransport();

    const result = await transport.send(message);

    expect(result.ok).toBe(true);
    expect(transport.outbox).toStrictEqual([message]);
  });

  it("dedupes a repeated idempotency key the way Resend does", async () => {
    const transport = createFakeTransport();

    const first = await transport.send(message);
    const second = await transport.send(message);

    expect(second).toStrictEqual(first);
    expect(transport.outbox).toHaveLength(1);
  });

  it("captures a resend under a new key as a separate email", async () => {
    const transport = createFakeTransport();

    await transport.send(message);
    await transport.send({ ...message, idempotencyKey: "verify-email/token-2" });

    expect(transport.outbox).toHaveLength(2);
  });

  it("forgets everything it captured when cleared", async () => {
    const transport = createFakeTransport();
    await transport.send(message);

    transport.clear();

    expect(transport.outbox).toStrictEqual([]);
  });
});
