-- Better Auth 1.7 scopes account identity by issuer instead of provider id.
-- Added nullable first so existing rows survive, then backfilled and locked.

ALTER TABLE "Account" ADD COLUMN "issuer" TEXT;

-- Google is the only provider this app offers. Anything else keeps its
-- provider id as the issuer, which is unique per provider and so preserves
-- the identity the old constraint enforced.
UPDATE "Account" SET "issuer" = 'https://accounts.google.com'
WHERE "issuer" IS NULL AND "providerId" = 'google';

UPDATE "Account" SET "issuer" = "providerId" WHERE "issuer" IS NULL;

ALTER TABLE "Account" ALTER COLUMN "issuer" SET NOT NULL;

DROP INDEX "Account_providerId_accountId_key";

CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
