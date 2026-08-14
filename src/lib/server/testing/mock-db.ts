import type { PrismaClient } from "$db/client.js";
import { mockDeep } from "vitest-mock-extended";
import type { DeepMockProxy } from "vitest-mock-extended";

export type MockDb = DeepMockProxy<PrismaClient>;

/**
 * A type-safe `PrismaClient` mock, per Prisma's dependency-injection testing pattern:
 * @see https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
 */
export function mockDb(): MockDb {
  return mockDeep<PrismaClient>();
}
