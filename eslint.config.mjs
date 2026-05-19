import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nested build artifacts inside git worktrees were producing ~500 spurious
    // lint errors. The patterns above only match repo-root .next; this catches
    // any .next anywhere in the tree (worktrees, fixtures, etc.).
    "**/.next/**",
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
