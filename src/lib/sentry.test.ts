import type { ErrorEvent } from "@sentry/sveltekit";

import { deriveModuleTag } from "./sentry";

function eventWithFrames(frames: { filename: string; in_app?: boolean }[]): ErrorEvent {
  return { exception: { values: [{ stacktrace: { frames } }] }, type: undefined };
}

describe("deriveModuleTag", () => {
  it("names the deepest in-app frame", () => {
    const event = eventWithFrames([
      { filename: "/app/src/routes/account/page.remote.ts" },
      { filename: "/app/src/lib/server/services/account.ts" },
    ]);

    expect(deriveModuleTag(event)).toBe("lib/server/services/account");
  });

  it("skips vendor frames thrown below our own code", () => {
    const event = eventWithFrames([
      { filename: "/app/src/lib/server/services/account.ts", in_app: true },
      { filename: "/app/node_modules/@prisma/client/runtime/library.js", in_app: false },
    ]);

    expect(deriveModuleTag(event)).toBe("lib/server/services/account");
  });

  it("leaves the tag off rather than guessing at a bundled filename", () => {
    const event = eventWithFrames([{ filename: "/app/build/server/chunks/account-Ab12Cd.js" }]);

    expect(deriveModuleTag(event)).toBeUndefined();
  });

  it("survives an event with no stack trace", () => {
    expect(deriveModuleTag({ type: undefined })).toBeUndefined();
  });
});
