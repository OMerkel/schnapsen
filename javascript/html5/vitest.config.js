import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.js"],
      exclude: [
        "src/test/**",
        "**/*.test.js",
        "**/*.spec.js",
        "src/index.js",
        "src/sw.js",
        "src/ui/**",
        "src/utils/**",
        "src/workers/**",
      ],
      lines: 96,
      functions: 96,
      branches: 96,
      statements: 96,
    },
    include: ["src/test/**/*.test.js"],
  },
});
