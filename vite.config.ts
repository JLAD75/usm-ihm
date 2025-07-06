import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      "/user": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      "/token": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  // Build prod : base à la racine
  base: "/",
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Garder React dans un seul chunk avec toutes ses dépendances
          vendor: ["react", "react-dom"],
          // UI libraries dans un chunk séparé
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
        },
      },
    },
  },
});
