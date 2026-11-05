-- Upgrade path from earlier Author-based schema (safe no-ops if already on new schema)

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'REVIEW';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "jobTitle" TEXT,
    "oabNumber" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "linkedInUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'Ederson Almeida — Direito',
    "tagline" TEXT NOT NULL DEFAULT 'Análises, materiais e atualidades jurídicas',
    "siteDescription" TEXT NOT NULL DEFAULT 'Portal de conteúdo jurídico com artigos, materiais e notícias do Direito.',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "contactEmail" TEXT,
    "defaultMetaTitle" TEXT,
    "defaultMetaDescription" TEXT,
    "defaultOgImage" TEXT,
    "twitterHandle" TEXT,
    "googleSiteVerification" TEXT,
    "gaMeasurementId" TEXT,
    "gtmContainerId" TEXT,
    "adsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleAdsClientId" TEXT,
    "adsHeadHtml" TEXT,
    "cookieConsentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cookieNoticeText" TEXT,
    "privacyPolicyHtml" TEXT,
    "termsHtml" TEXT,
    "legalDisclaimer" TEXT,
    "postsPerPage" INTEGER NOT NULL DEFAULT 12,
    "allowPublicSearch" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");

DO $$ BEGIN
  ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "readingMinutes" INTEGER;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "ogImage" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Post_featured_idx" ON "Post"("featured");
