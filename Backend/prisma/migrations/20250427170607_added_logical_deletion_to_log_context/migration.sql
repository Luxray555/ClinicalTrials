/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "log" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "log_context" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
