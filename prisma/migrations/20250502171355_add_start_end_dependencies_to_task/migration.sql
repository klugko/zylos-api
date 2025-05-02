-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dependencies" TEXT[],
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
