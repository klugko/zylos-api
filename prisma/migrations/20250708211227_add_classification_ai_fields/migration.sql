-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "validationRequired" BOOLEAN NOT NULL DEFAULT false;
