import { defineConfig } from "vitest/config";
import path from "path";

import { fileURLToPath } from "url";

const rootDir = typeof import.meta.dirname !== "undefined" ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./"),
      "@shared": path.resolve(rootDir, "./shared"),
      "@assets": path.resolve(rootDir, "./assets"),
    },
  },
  test: {
    environment: "node",
  },
});
