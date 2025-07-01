/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `targetId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommentTargetType" AS ENUM ('PROJECT', 'TASK', 'CHECKLIST');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "updatedAt",
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" "CommentTargetType" NOT NULL,
ALTER COLUMN "taskId" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
