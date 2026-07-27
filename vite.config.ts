import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      adapter: "vercel",
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      compilerOptions: {
        runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
        experimental: { async: true },
      },
      experimental: {
        remoteFunctions: true,
        tracing: { server: true },
        instrumentation: { server: true },
      },
      typescript: {
        config: (config) => {
          return {
            ...config,
            include: [...config.include, "prisma.config.ts", "vite.config.ts"],
          };
        },
      },
    }),
  ],
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }],
          },
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"],
        },
      },

      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
