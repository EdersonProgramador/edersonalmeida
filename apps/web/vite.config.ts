import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192.png", "pwa-512.png"],
      manifest: {
        id: "/",
        name: "Ederson Almeida — Portal jurídico",
        short_name: "Ederson Almeida",
        description: "Portal de conteúdo jurídico com artigos, materiais e notícias.",
        lang: "pt-BR",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#0f1729",
        background_color: "#f7f4ee",
        categories: ["education", "news"],
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/auth\//,
          /^\/admin\/(stats|settings|posts|categories|uploads)(\/.*)?$/,
          /^\/public\//,
          /^\/uploads\//,
          /^\/health$/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/public/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-public",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 10 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: "/index.html",
      },
    }),
  ],
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
