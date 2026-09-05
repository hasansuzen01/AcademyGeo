-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Meta" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT;

-- Backfill the slug for metas seeded before the column existed. Their picture
-- lives at /metas/<slug>.svg, which is where the identity came from.
UPDATE "Meta"
SET "slug" = substring("imageUrl" from '([^/]+)\.svg$')
WHERE "slug" IS NULL AND "imageUrl" LIKE '%.svg';

-- Anything else falls back to its primary key so the column can be required.
UPDATE "Meta" SET "slug" = "id" WHERE "slug" IS NULL;

ALTER TABLE "Meta" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameTr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "descriptionTr" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT,
    "coverImageKey" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckMeta" (
    "deckId" TEXT NOT NULL,
    "metaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DeckMeta_pkey" PRIMARY KEY ("deckId","metaId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_slug_key" ON "Deck"("slug");

-- CreateIndex
CREATE INDEX "Deck_isPublished_idx" ON "Deck"("isPublished");

-- CreateIndex
CREATE INDEX "DeckMeta_deckId_position_idx" ON "DeckMeta"("deckId", "position");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Meta_slug_key" ON "Meta"("slug");

-- CreateIndex
CREATE INDEX "Meta_isPublished_idx" ON "Meta"("isPublished");

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckMeta" ADD CONSTRAINT "DeckMeta_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckMeta" ADD CONSTRAINT "DeckMeta_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

