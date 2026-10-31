import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design reference markup exported from the drawups — not app code.
    "docs/**",
    // Claude Code agent worktrees: full parallel copies of this app.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
