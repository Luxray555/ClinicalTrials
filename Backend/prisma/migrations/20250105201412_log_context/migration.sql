/*
  Warnings:

  - The values [DONE_LOADING_DATA] on the enum `LogEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogEventType_new" AS ENUM ('DATA_LOADING', 'DATA_REFRESHING', 'DATA_SCAN');
ALTER TABLE "log" ALTER COLUMN "log_event_type" TYPE "LogEventType_new" USING ("log_event_type"::text::"LogEventType_new");
ALTER TYPE "LogEventType" RENAME TO "LogEventType_old";
ALTER TYPE "LogEventType_new" RENAME TO "LogEventType";
DROP TYPE "LogEventType_old";
COMMIT;
