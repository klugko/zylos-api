/*
  Warnings:

  - You are about to drop the `PartnerActivityLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('TASK', 'PROJECT', 'DOCUMENT', 'USER', 'SURVEY', 'COMMENT', 'CHAT', 'NOTIFICATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."ActivityAction" AS ENUM ('TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_STATUS_CHANGED', 'TASK_PRIORITY_CHANGED', 'TASK_DUE_DATE_CHANGED', 'TASK_COMMENTED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'PROJECT_STARTED', 'PROJECT_COMPLETED', 'PROJECT_PAUSED', 'PROJECT_ARCHIVED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'PROJECT_ACCESS_CHANGED', 'DOCUMENT_UPLOADED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'DOCUMENT_SHARED', 'DOCUMENT_ACCESS_CHANGED', 'DOCUMENT_VERSION_CREATED', 'DOCUMENT_SIGNED', 'DOCUMENT_COMMENTED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'USER_REGISTERED', 'USER_UPDATED', 'USER_DEACTIVATED', 'USER_ROLE_CHANGED', 'SURVEY_CREATED', 'SURVEY_UPDATED', 'SURVEY_DELETED', 'SURVEY_ACTIVATED', 'SURVEY_CLOSED', 'SURVEY_VOTED', 'SURVEY_RESULTS_VIEWED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'COMMENT_LIKED', 'COMMENT_DISLIKED', 'CHAT_MESSAGE_SENT', 'CHAT_MESSAGE_EDITED', 'CHAT_MESSAGE_DELETED', 'CHAT_ROOM_CREATED', 'CHAT_ROOM_JOINED', 'CHAT_ROOM_LEFT', 'NOTIFICATION_SENT', 'NOTIFICATION_READ', 'NOTIFICATION_DELETED', 'SYSTEM_BACKUP', 'SYSTEM_MAINTENANCE', 'SYSTEM_ERROR', 'SYSTEM_WARNING');

-- DropForeignKey
ALTER TABLE "public"."PartnerActivityLog" DROP CONSTRAINT "PartnerActivityLog_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PartnerActivityLog" DROP CONSTRAINT "PartnerActivityLog_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PartnerActivityLog" DROP CONSTRAINT "PartnerActivityLog_userId_fkey";

-- DropTable
DROP TABLE "public"."PartnerActivityLog";

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "taskId" TEXT,
    "documentId" TEXT,
    "surveyId" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "action" "public"."ActivityAction" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "public"."activity_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_projectId_createdAt_idx" ON "public"."activity_logs"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_type_action_idx" ON "public"."activity_logs"("type", "action");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "public"."activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
