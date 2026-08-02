import { defineConfig } from "prisma/config";
import { loadEnv } from "vite";

const env = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env["DATABASE_URL"],
  },
});
