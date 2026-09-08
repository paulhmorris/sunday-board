import { Logger } from "$lib/logger";
import type { EmailTransport } from "$lib/server/email";
import { passwordResetEmail, verificationCodeEmail } from "$lib/server/email/templates";
import { VERIFICATION_CODE_EXPIRY_SECONDS, VERIFICATION_CODE_LENGTH } from "$lib/verification";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth/minimal";
import { emailOTP } from "better-auth/plugins/email-otp";
import { sveltekitCookies } from "better-auth/svelte-kit";

const logger = new Logger("BetterAuth");

interface CreateAuthInput {
  baseURL: string;
  database: BetterAuthOptions["database"];
  /** SvelteKit's `getRequestEvent`. Omitted outside a request — a test has no cookies to sync. */
  getRequestEvent?: Parameters<typeof sveltekitCookies>[0];
  secret: string;
  sendEmail: EmailTransport["send"];
}

/**
 * The whole auth configuration, with its two ambient dependencies — the database and the mail
 * transport — passed in, so a test can build the same instance against an in-memory pair.
 */
export function createAuth({ baseURL, database, getRequestEvent, secret, sendEmail }: CreateAuthInput) {
  return betterAuth({
    advanced: {
      cookiePrefix: "sb",
    },
    baseURL,
    database,
    emailAndPassword: {
      enabled: true,
      // Deliberately no `requireEmailVerification`: an unverified account must be able to sign in
      // and reach the verification screen, which is where a mistyped address gets corrected.
      // `requireVerifiedUser` in `auth-guards` is what keeps them out of the rest of the product.

      // Better Auth logs and swallows whatever a mail callback throws, so a failed send cannot
      // fail the request that triggered it. `sendEmail` has already logged it and reported it to
      // Sentry; the user's recourse is to ask for another email.
      sendResetPassword: async ({ token, url, user }) => {
        await sendEmail({
          ...passwordResetEmail({ name: user.name, url }),
          idempotencyKey: `reset-password/${token}`,
          to: user.email,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
    },
    /**
     * Better Auth catches everything its background tasks throw — the mail callbacks among them —
     * and reports it here and nowhere else. Without this it would reach a console and stop there.
     */
    logger: {
      log: (level, message, ...args) => logger[level](message, { args }),
    },
    plugins: [
      emailOTP({
        allowedAttempts: 3,
        expiresIn: VERIFICATION_CODE_EXPIRY_SECONDS,
        otpLength: VERIFICATION_CODE_LENGTH,
        // Turns the default verification link into a code, including the one `sendOnSignUp` sends.
        overrideDefaultEmailVerification: true,
        sendVerificationOTP: async ({ email, otp }) => {
          await sendEmail({
            ...verificationCodeEmail({ code: otp, expiresInMinutes: VERIFICATION_CODE_EXPIRY_SECONDS / 60 }),
            // Nothing to dedupe on: every request must deliver a distinct code, and deriving the
            // key from the code itself would let a repeated one suppress a genuinely new send.
            idempotencyKey: `verify-email/${crypto.randomUUID()}`,
            to: email,
          });
        },
        // A code we cannot read back is a code a database leak cannot hand out.
        storeOTP: "hashed",
      }),
      ...(getRequestEvent ? [sveltekitCookies(getRequestEvent)] : []),
    ],
    /**
     * Only runs for calls that go through the router — see `callAuthEndpoint`. Better Auth's own
     * rules already cover the endpoints that mail a code; `/change-email` is here because
     * `updateEmailWithoutVerification` makes it mail one too, and its default rule is the looser
     * sign-in-shaped 3 per 10 seconds.
     */
    rateLimit: {
      customRules: {
        "/change-email": { max: 3, window: 60 },
      },
    },
    secret,
    session: {
      cookieCache: { enabled: true },
    },
    user: {
      additionalFields: {
        role: {
          input: false,
          type: "string",
        },
      },
      changeEmail: {
        enabled: true,
        // The point of the flow: an unverified address was mistyped, so it is worth nothing and
        // is replaced outright. A verified address never reaches here — the screen is gated.
        updateEmailWithoutVerification: true,
      },
    },
  });
}
