import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // publicDir: './static/',
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: true,
    open: true,
  },
});