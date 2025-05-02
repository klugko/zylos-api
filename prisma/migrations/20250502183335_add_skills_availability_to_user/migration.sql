-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "skills" TEXT[];
