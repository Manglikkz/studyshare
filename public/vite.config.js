// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Daftarkan semua file HTML kamu di sini
        main: resolve(__dirname, "index.html"),
        upload: resolve(__dirname, "upload.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
});
