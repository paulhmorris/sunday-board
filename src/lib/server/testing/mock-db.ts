import type { PrismaClient } from "$db/client.js";
import { db } from "$lib/server/db";
import type { DeepMockProxy } from "vitest-mock-extended";

export type MockDb = DeepMockProxy<PrismaClient>;

/**
 * The `db` singleton, typed as the mock that `testing/setup.ts` swapped it for. Import this in a
 * test to stub a query; the service under test imports the real module path and gets the same object.
 */
export const mockDb = db as unknown as MockDb;
