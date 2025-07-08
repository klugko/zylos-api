-- CreateTable
CREATE TABLE "DocumentNotificationRule" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "targetEmail" TEXT,
    "targetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentNotificationRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentNotificationRule" ADD CONSTRAINT "DocumentNotificationRule_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
