-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChecklistPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "assignedUserId" TEXT,
ADD COLUMN     "priority" "ChecklistPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "status" "ChecklistStatus" NOT NULL DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
