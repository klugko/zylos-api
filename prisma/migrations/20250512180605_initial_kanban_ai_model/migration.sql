-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "aiSuggestions" JSONB;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "estimatedTime" INTEGER;
