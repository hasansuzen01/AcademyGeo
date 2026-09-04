-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "coverImageKey" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '',
    "canonicalUrl" TEXT,
    "robotsMeta" TEXT NOT NULL DEFAULT 'index,follow',
    "ogImageUrl" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 1,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "robotsMeta" TEXT NOT NULL DEFAULT 'index,follow',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "includeInSitemap" BOOLEAN NOT NULL DEFAULT true,
    "footerOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSeo" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "siteName" TEXT NOT NULL DEFAULT 'AcademyGeo',
    "siteUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "defaultMetaTitle" TEXT NOT NULL DEFAULT '',
    "defaultMetaDescription" TEXT NOT NULL DEFAULT '',
    "defaultKeywords" TEXT NOT NULL DEFAULT '',
    "defaultOgImageUrl" TEXT,
    "robotsTxt" TEXT,
    "defaultRobotsMeta" TEXT NOT NULL DEFAULT 'index,follow',
    "blockIndexingOutsideProduction" BOOLEAN NOT NULL DEFAULT true,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "googleSiteVerification" TEXT,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "bingSiteVerification" TEXT,
    "twitterSite" TEXT,
    "organisationName" TEXT NOT NULL DEFAULT 'AcademyGeo',
    "organisationLogo" TEXT,
    "contactEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_locale_status_publishedAt_idx" ON "Post"("locale", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_locale_slug_key" ON "Post"("locale", "slug");

-- CreateIndex
CREATE INDEX "Page_locale_status_idx" ON "Page"("locale", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Page_locale_slug_key" ON "Page"("locale", "slug");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
