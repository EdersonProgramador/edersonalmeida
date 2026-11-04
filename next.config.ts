import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* CMS: conteúdo vem do banco; revalidação via server actions */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
