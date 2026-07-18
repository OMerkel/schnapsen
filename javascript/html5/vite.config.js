import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Use relative asset paths so dist/index.html works from folder-based static servers.
  base: "./",
  root: "src",
  // Keep deck SVGs in src/img as single source of truth.
  publicDir: false,
  plugins: [
    {
      name: "copy-src-img-to-dist",
      apply: "build",
      closeBundle() {
        const sourceDir = resolve(__dirname, "src/img");
        const targetDir = resolve(__dirname, "dist/img");
        const sourceSw = resolve(__dirname, "src/sw.js");
        const targetSw = resolve(__dirname, "dist/sw.js");
        const sourceManifest = resolve(__dirname, "src/manifest.json");
        const targetManifest = resolve(__dirname, "dist/manifest.json");

        if (existsSync(sourceDir)) {
          cpSync(sourceDir, targetDir, { recursive: true, force: true });
        }
        if (existsSync(sourceSw)) {
          cpSync(sourceSw, targetSw, { force: true });
        }
        if (existsSync(sourceManifest)) {
          cpSync(sourceManifest, targetManifest, { force: true });
        }
      },
    },
  ],
  build: {
    outDir: "../dist",
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: false,
  },
});
