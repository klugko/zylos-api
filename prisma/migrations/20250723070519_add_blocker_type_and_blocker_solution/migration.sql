-- CreateEnum
CREATE TYPE "BlockerType" AS ENUM ('INACTIVE_TASK', 'CIRCULAR_DEPENDENCY', 'SKILL_MISMATCH', 'WORKLOAD_OVERLOAD', 'UNCLEAR_REQUIREMENTS', 'DEPENDENCY_BLOCKED', 'RESOURCE_UNAVAILABLE');

-- CreateEnum
CREATE TYPE "BlockerSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('SUGGESTED', 'APPLIED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "TaskBlocker" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "blockerType" "BlockerType" NOT NULL,
    "severity" "BlockerSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "aiAnalysis" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockerSolution" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "solutionType" TEXT NOT NULL,
    "description" TEXT,
    "aiReasoning" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" "SolutionStatus" NOT NULL DEFAULT 'SUGGESTED',
    "suggestedUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "BlockerSolution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskBlocker" ADD CONSTRAINT "TaskBlocker_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskBlocker" ADD CONSTRAINT "TaskBlocker_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockerSolution" ADD CONSTRAINT "BlockerSolution_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "TaskBlocker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockerSolution" ADD CONSTRAINT "BlockerSolution_suggestedUserId_fkey" FOREIGN KEY ("suggestedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
