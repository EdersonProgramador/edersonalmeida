import type { Prisma, PrismaClient } from "@prisma/client";

export const authorSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  jobTitle: true,
  oabNumber: true,
} as const;

export type PostAuthor = Prisma.UserGetPayload<{ select: typeof authorSelect }>;

export const postCategoryInclude = {
  category: { include: { parent: true } },
} satisfies Prisma.PostInclude;

const fallbackAuthor = (authorId: string): PostAuthor => ({
  id: authorId,
  name: "Autor",
  avatarUrl: null,
  jobTitle: null,
  oabNumber: null,
});

export async function attachAuthorsToPosts<
  T extends { authorId: string },
>(prisma: PrismaClient, posts: T[]): Promise<(T & { author: PostAuthor })[]> {
  if (posts.length === 0) return [];

  const ids = [...new Set(posts.map((p) => p.authorId))];
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: authorSelect });
  const byId = new Map(users.map((u) => [u.id, u]));
  const defaultUser = users[0] ?? (await prisma.user.findFirst({ select: authorSelect }));

  return posts.map((post) => ({
    ...post,
    author: byId.get(post.authorId) ?? defaultUser ?? fallbackAuthor(post.authorId),
  }));
}

export async function attachAuthorToPost<T extends { authorId: string }>(
  prisma: PrismaClient,
  post: T | null,
): Promise<(T & { author: PostAuthor }) | null> {
  if (!post) return null;
  const [withAuthor] = await attachAuthorsToPosts(prisma, [post]);
  return withAuthor;
}
