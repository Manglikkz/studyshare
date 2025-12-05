import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Mendaftarkan file agar ikut di-build
        main: "index.html",
        upload: "upload.html",
        admin: "admin.html",
      },
    },
  },
});
