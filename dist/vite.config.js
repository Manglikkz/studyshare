import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "public/admin.html"),
        upload: resolve(__dirname, "public/upload.html"),
      },
    },
    outDir: "dist",
  },
});
