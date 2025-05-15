-- CreateEnum
CREATE TYPE "SourceName" AS ENUM ('CLINICAL_TRIALS_GOV', 'ECLAIRE');

-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('DATA_LOADING', 'DATA_REFRESHING', 'DATA_SCAN');

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "logInformation" VARCHAR(255) NOT NULL,
    "source_name" "SourceName" NOT NULL,
    "log_event_type" "LogEventType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "etlPipeLineRequestId" INTEGER,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etl_pipeline_request" (
    "id" SERIAL NOT NULL,
    "numberOfTrials" INTEGER,
    "startingFrom" INTEGER,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "status" TEXT,
    "country" TEXT,
    "conditions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etl_pipeline_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_etlPipeLineRequestId_fkey" FOREIGN KEY ("etlPipeLineRequestId") REFERENCES "etl_pipeline_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
