import type { PrismaClient } from "@prisma/client";

/** Posts legados podem apontar authorId para a tabela Author antiga — reatribui ao primeiro usuário. */
export async function repairOrphanPosts(prisma: PrismaClient) {
  const fallbackUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!fallbackUser) return;

  const authorFix = await prisma.$executeRaw`
    UPDATE "Post"
    SET "authorId" = ${fallbackUser.id}
    WHERE NOT EXISTS (
      SELECT 1 FROM "User" u WHERE u."id" = "Post"."authorId"
    )
  `;

  const fallbackCategory = await prisma.category.findFirst({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  let categoryFix = 0;
  if (fallbackCategory) {
    categoryFix = await prisma.$executeRaw`
      UPDATE "Post"
      SET "categoryId" = ${fallbackCategory.id}
      WHERE NOT EXISTS (
        SELECT 1 FROM "Category" c WHERE c."id" = "Post"."categoryId"
      )
    `;
  }

  if (authorFix > 0 || categoryFix > 0) {
    console.info(`[repair] posts atualizados: author=${authorFix}, category=${categoryFix}`);
  }
}
