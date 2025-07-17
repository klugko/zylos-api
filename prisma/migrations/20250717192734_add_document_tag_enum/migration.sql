/*
  Warnings:

  - The `tags` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentTag" AS ENUM ('CC', 'CTC', 'CTF', 'OC', 'PVR', 'DV', 'FA', 'DJ', 'DC', 'NI', 'BDG', 'RAP', 'PLN', 'CRR', 'SPF', 'SPT', 'ETU', 'CHP', 'AVC', 'MNT', 'RCX');

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "tags",
ADD COLUMN     "tags" "DocumentTag"[] DEFAULT ARRAY[]::"DocumentTag"[];
