import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["prisma/generated/**"],
  printWidth: 120,
  sortImports: true,
  sortTailwindcss: true,
  svelte: true,
});
