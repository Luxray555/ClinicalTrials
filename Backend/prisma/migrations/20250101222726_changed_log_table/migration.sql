/*
  Warnings:

  - You are about to drop the column `etlPipeLineRequestId` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `source_name` on the `log` table. All the data in the column will be lost.
  - You are about to drop the `etl_pipeline_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_etlPipeLineRequestId_fkey";

-- AlterTable
ALTER TABLE "log" DROP COLUMN "etlPipeLineRequestId",
DROP COLUMN "source_name",
ADD COLUMN     "logContextId" INTEGER;

-- DropTable
DROP TABLE "etl_pipeline_request";

-- CreateTable
CREATE TABLE "log_context" (
    "source_name" "SourceName" NOT NULL,
    "id" SERIAL NOT NULL,
    "number_of_trials" INTEGER,
    "starting_from" INTEGER,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "status" TEXT,
    "country" TEXT,
    "conditions" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_context_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_logContextId_fkey" FOREIGN KEY ("logContextId") REFERENCES "log_context"("id") ON DELETE SET NULL ON UPDATE CASCADE;
