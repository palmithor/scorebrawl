import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    globals: true,
    exclude: [...configDefaults.exclude, "**/playwright/**"],
    alias: {
      "~/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
    globalSetup: ["./tests/setup/global-setup.ts"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      all: true,
    },
  },
});
