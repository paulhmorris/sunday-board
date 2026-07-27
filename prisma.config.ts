import { loadEnv } from "vite";
import { defineConfig } from "prisma/config";

const env = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env["DATABASE_URL"],
  },
});
