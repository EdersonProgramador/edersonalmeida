import type { PrismaClient } from "@prisma/client";

/** Posts legados: authorId apontava para Author; FK impede UPDATE até dropar a constraint. */
export async function repairOrphanPosts(prisma: PrismaClient) {
  try {
    const fallbackUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!fallbackUser) {
      console.warn("[repair] nenhum usuário — pulando correção de posts");
      return;
    }

    await prisma.$executeRawUnsafe(`ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_categoryId_fkey"`);

    const authorFix = await prisma.$executeRaw`
      UPDATE "Post"
      SET "authorId" = ${fallbackUser.id}
      WHERE "authorId" IS NULL
         OR NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = "Post"."authorId")
    `;

    const fallbackCategory = await prisma.category.findFirst({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    let categoryFix = 0;
    if (fallbackCategory) {
      categoryFix = await prisma.$executeRaw`
        UPDATE "Post"
        SET "categoryId" = ${fallbackCategory.id}
        WHERE "categoryId" IS NULL
           OR NOT EXISTS (SELECT 1 FROM "Category" c WHERE c."id" = "Post"."categoryId")
      `;
    }

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey"
          FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    if (fallbackCategory) {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }

    if (authorFix > 0 || categoryFix > 0) {
      console.info(`[repair] posts corrigidos: author=${authorFix}, category=${categoryFix}`);
    }
  } catch (err) {
    console.error("[repair] falha ao corrigir posts legados (API continua):", err);
  }
}
