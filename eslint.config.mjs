import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // fetch is a browser API legitimately used in Next.js client code.
      // The n/no-unsupported-features/node-builtins rule incorrectly flags it
      // because the Node.js engine range (>=16.0.0) predates stable fetch (v21).
      "n/no-unsupported-features/node-builtins": ["error", { ignores: ["fetch"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
