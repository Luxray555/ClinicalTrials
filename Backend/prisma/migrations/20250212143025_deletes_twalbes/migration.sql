/*
  Warnings:

  - The values [DONE_LOADING_DATA] on the enum `LogEventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log_context` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum

-- DropTable
DROP TABLE "log";

-- DropTable
DROP TABLE "log_context";

-- DropEnum
DROP TYPE "SourceName";
