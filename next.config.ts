import type { NextConfig } from "next";

const prismaFiles = [
  "./node_modules/.prisma/client/**",
  "./node_modules/@prisma/client/**",
  "./prisma/schema.prisma",
  "./prisma/data.db",
  "./prisma/migrations/**",
];

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/*": prismaFiles,
    "/admin": prismaFiles,
    "/admin/**": prismaFiles,
    "/categoria/**": prismaFiles,
    "/publicacao/**": prismaFiles,
    "/api/**": prismaFiles,
  },
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
