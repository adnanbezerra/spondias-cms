-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Align with Prisma schema (required field without DB default)
ALTER TABLE "User" ALTER COLUMN "name" DROP DEFAULT;
