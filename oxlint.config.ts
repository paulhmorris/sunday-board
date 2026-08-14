import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    pedantic: "off",
    perf: "warn",
    suspicious: "warn",
  },
  env: {
    builtin: true,
  },
  ignorePatterns: ["prisma/generated/**"],
  overrides: [
    {
      files: ["src/**/*.test.ts"],
      plugins: ["vitest"],
    },
  ],
  plugins: ["typescript", "unicorn", "oxc", "import"],
  rules: {
    "import/no-unassigned-import": ["warn", { allow: ["**/*.css"] }],
  },
});
