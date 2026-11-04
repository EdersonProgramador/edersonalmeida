import type { PostStatus, PostType } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PostFilters = {
  categorySlug?: string;
  type?: PostType;
  status?: PostStatus;
  limit?: number;
};

export async function listPublishedPosts(filters: PostFilters = {}) {
  const { categorySlug, type, limit } = filters;
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(type ? { type } : {}),
      ...(categorySlug
        ? { category: { slug: categorySlug } }
        : {}),
    },
    include: { category: true, author: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, author: true },
  });
}

export async function listCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
