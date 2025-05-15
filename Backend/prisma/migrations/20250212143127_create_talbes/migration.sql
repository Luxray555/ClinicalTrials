-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "logInformation" VARCHAR(255) NOT NULL,
    "context_type" "LogEventType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "logContextId" INTEGER,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_context" (
    "source_name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "number_of_trials" INTEGER,
    "starting_from" INTEGER,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "status" TEXT[],
    "log_event_type" "LogEventType" NOT NULL,
    "country" TEXT,
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_context_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_logContextId_fkey" FOREIGN KEY ("logContextId") REFERENCES "log_context"("id") ON DELETE SET NULL ON UPDATE CASCADE;
