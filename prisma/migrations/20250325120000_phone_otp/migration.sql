-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_number" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- Existing accounts without a phone are treated as already verified (legacy users)
UPDATE "User" SET "is_verified" = true WHERE "phone_number" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_number_key" ON "User"("phone_number");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Otp" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Otp_phone_number_idx" ON "Otp"("phone_number");
