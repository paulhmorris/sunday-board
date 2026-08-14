import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [
    mode !== "development" &&
      sentrySvelteKit({
        adapter: "node",
        authToken: process.env.ENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        telemetry: false,
      }),
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      alias: {
        "$db/*": "./prisma/generated/*",
      },
      compilerOptions: {
        experimental: { async: true },
        runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
      },
      experimental: {
        explicitEnvironmentVariables: true,
        instrumentation: { server: true },
        remoteFunctions: true,
        tracing: { server: true },
      },
      typescript: {
        config: (config) => ({
          ...config,
          include: [...config.include, "prisma.config.ts", "vite.config.ts"],
        }),
      },
    }),
  ].filter(Boolean),
  test: {
    globals: true,
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          browser: {
            enabled: true,
            instances: [{ browser: "chromium", headless: true }],
            provider: playwright(),
          },
          exclude: ["src/lib/server/**"],
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          name: "client",
        },
      },

      {
        extends: "./vite.config.ts",
        test: {
          environment: "node",
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          include: ["src/**/*.{test,spec}.{js,ts}"],
          name: "server",
        },
      },
    ],
  },
}));
