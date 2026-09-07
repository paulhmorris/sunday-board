import { VERIFICATION_CODE_EXPIRY_SECONDS } from "$lib/verification";
import { memoryAdapter } from "better-auth/adapters/memory";
import { isAPIError } from "better-auth/api";

import { createAuth } from "./auth-config";
import { createFakeTransport } from "./email/fake";
import type { FakeEmailTransport } from "./email/fake";

const signUp = { email: "musician@example.com", name: "Ada", password: "sunday-board-1!" };

function testAuth() {
  const transport = createFakeTransport();

  return {
    auth: createAuth({
      baseURL: "http://localhost:5173",
      database: memoryAdapter({ account: [], session: [], user: [], verification: [] }),
      secret: "test-secret-that-is-at-least-32-characters",
      sendEmail: transport.send,
    }),
    transport,
  };
}

/** The code as the user reads it — from the mail we would have sent, never from the database. */
function latestCode(transport: FakeEmailTransport) {
  const email = transport.outbox.at(-1);
  const code = email?.text.match(/\b\d{6}\b/)?.[0];
  if (!code) {
    throw new Error(`No verification code in the outbox (${transport.outbox.length} emails captured)`);
  }
  return code;
}

/** The code Better Auth refused with — what a caller branches on, e.g. `OTP_EXPIRED`. */
async function refusal(call: Promise<unknown>) {
  try {
    await call;
  } catch (error) {
    return isAPIError(error) ? error.body?.code : error;
  }
  throw new Error("Expected the call to be refused, but it succeeded");
}

describe("email verification by one-time code", () => {
  it("emails a code on sign-up", async () => {
    const { auth, transport } = testAuth();

    await auth.api.signUpEmail({ body: signUp });

    expect(transport.outbox).toHaveLength(1);
    expect(transport.outbox[0]?.to).toBe(signUp.email);
    expect(latestCode(transport)).toMatch(/^\d{6}$/);
  });

  it("marks the account verified when the correct code is entered", async () => {
    const { auth, transport } = testAuth();
    await auth.api.signUpEmail({ body: signUp });

    const { status, user } = await auth.api.verifyEmailOTP({
      body: { email: signUp.email, otp: latestCode(transport) },
    });

    expect(status).toBe(true);
    expect(user.emailVerified).toBe(true);
  });

  it("refuses a wrong code, leaving the account unverified", async () => {
    const { auth, transport } = testAuth();
    await auth.api.signUpEmail({ body: signUp });
    const wrong = latestCode(transport) === "000000" ? "111111" : "000000";

    expect(await refusal(auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: wrong } }))).toBe("INVALID_OTP");

    const correct = auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: latestCode(transport) } });
    await expect(correct).resolves.toMatchObject({ user: { emailVerified: true } });
  });

  it("refuses a code once it has expired", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { auth, transport } = testAuth();
    await auth.api.signUpEmail({ body: signUp });
    const code = latestCode(transport);

    vi.advanceTimersByTime((VERIFICATION_CODE_EXPIRY_SECONDS + 1) * 1000);

    expect(await refusal(auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: code } }))).toBe("OTP_EXPIRED");
    vi.useRealTimers();
  });

  it("refuses a code that has already been used", async () => {
    const { auth, transport } = testAuth();
    await auth.api.signUpEmail({ body: signUp });
    const code = latestCode(transport);
    await auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: code } });

    expect(await refusal(auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: code } }))).toBe("INVALID_OTP");
  });

  it("mails a fresh code on request, and the old one stops working", async () => {
    const { auth, transport } = testAuth();
    await auth.api.signUpEmail({ body: signUp });
    const original = latestCode(transport);

    await auth.api.sendVerificationOTP({ body: { email: signUp.email, type: "email-verification" } });
    const replacement = latestCode(transport);

    expect(transport.outbox).toHaveLength(2);
    expect(replacement).not.toBe(original);
    expect(await refusal(auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: original } }))).toBe(
      "INVALID_OTP",
    );
    await expect(auth.api.verifyEmailOTP({ body: { email: signUp.email, otp: replacement } })).resolves.toMatchObject({
      status: true,
    });
  });

  it("refuses a second account on an address that already has one", async () => {
    const { auth } = testAuth();
    await auth.api.signUpEmail({ body: signUp });

    expect(await refusal(auth.api.signUpEmail({ body: signUp }))).toBe("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
  });
});

describe("correcting a mistyped address before verifying", () => {
  it("moves the account to the new address and mails the code there", async () => {
    const { auth, transport } = testAuth();
    const { headers } = await auth.api.signUpEmail({ body: signUp, returnHeaders: true });
    const session = new Headers({ cookie: headers.getSetCookie().join("; ") });

    await auth.api.changeEmail({ body: { newEmail: "corrected@example.com" }, headers: session });

    expect(transport.outbox.at(-1)?.to).toBe("corrected@example.com");
    await expect(
      auth.api.verifyEmailOTP({ body: { email: "corrected@example.com", otp: latestCode(transport) } }),
    ).resolves.toMatchObject({ user: { email: "corrected@example.com", emailVerified: true } });
  });
});
