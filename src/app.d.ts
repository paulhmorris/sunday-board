// See https://svelte.dev/docs/kit/types#app.d.ts
import type { auth } from "$lib/server/auth";
import type { Session, User } from "better-auth";

// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      /** Sentry event id on 5xx, otherwise a generated id. Quote it to find the event. */
      errorId: string;
    }
    interface Locals {
      user: typeof auth.$Infer.Session.user | null;
      session: typeof auth.$Infer.Session.session | null;
    }

    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
