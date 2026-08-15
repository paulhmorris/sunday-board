import type { PrismaClient } from "$db/client.js";

/**
 * Installs the `db` singleton mock for every server test. The factory imports lazily because
 * `vi.mock` is hoisted above this file's own imports.
 */
vi.mock("$lib/server/db", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return { db: mockDeep<PrismaClient>() };
});

beforeEach(async () => {
  const { mockReset } = await import("vitest-mock-extended");
  const { db } = await import("$lib/server/db");
  mockReset(db);
});
