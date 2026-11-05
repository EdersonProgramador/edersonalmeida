import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  build: { outDir: "../../dist", emptyOutDir: true },
  server: {
    port: 5175,
    proxy: {
      "/auth": "http://localhost:3333",
      "/admin": "http://localhost:3333",
      "/public": "http://localhost:3333",
      "/uploads": "http://localhost:3333",
      "/health": "http://localhost:3333",
    },
  },
});
