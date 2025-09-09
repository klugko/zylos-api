-- CreateEnum
CREATE TYPE "public"."SimulationScenario" AS ENUM ('OPTIMAL', 'REALISTIC', 'DEGRADED');

-- CreateTable
CREATE TABLE "public"."project_simulations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarios" JSONB NOT NULL,
    "impactFactors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_simulations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."project_simulations" ADD CONSTRAINT "project_simulations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_simulations" ADD CONSTRAINT "project_simulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
