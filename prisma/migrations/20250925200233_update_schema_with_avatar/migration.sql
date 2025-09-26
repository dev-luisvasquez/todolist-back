/*
  Warnings:

  - Added the required column `avatar` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add avatar column with default value first
ALTER TABLE "public"."users" ADD COLUMN "avatar" VARCHAR(255) NOT NULL DEFAULT 'default-avatar.png';

-- Update existing records with a default avatar if needed
-- You can customize this default value as needed
UPDATE "public"."users" SET "avatar" = 'default-avatar.png' WHERE "avatar" IS NULL;
