import { DATABASE_URL } from "$env/static/private";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../../prisma/generated/prisma/client.js";

const globalForDb = globalThis as unknown as { db?: PrismaClient };
const adapter = new PrismaPg({ connectionString: DATABASE_URL });

export const db = globalForDb.db ?? new PrismaClient({ adapter });

if (import.meta.env.MODE !== "development") {
  globalForDb.db = db;
}
