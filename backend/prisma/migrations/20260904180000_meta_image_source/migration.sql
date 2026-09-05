-- Separates real photographs from the seeded diagrams that stand in for them,
-- so the card can frame each correctly and admins can see what still needs a
-- real picture.

CREATE TYPE "ImageSource" AS ENUM ('PHOTO', 'ILLUSTRATION');

ALTER TABLE "Meta" ADD COLUMN "imageSource" "ImageSource" NOT NULL DEFAULT 'ILLUSTRATION';

-- Anything already uploaded to the bucket is a real picture; the generated
-- artwork is served from the app itself and has no object key.
UPDATE "Meta" SET "imageSource" = 'PHOTO' WHERE "imageKey" IS NOT NULL;

CREATE INDEX "Meta_imageSource_idx" ON "Meta"("imageSource");
