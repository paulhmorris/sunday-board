import { defineConfig } from "prisma/config";
import { loadEnv } from "vite";

const env = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");

export default defineConfig({
  datasource: {
    url: env["DATABASE_URL"],
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/",
});
