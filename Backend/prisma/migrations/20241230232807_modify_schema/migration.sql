/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_accountId_fkey";

-- DropForeignKey
ALTER TABLE "doctor" DROP CONSTRAINT "doctor_accountId_fkey";

-- DropForeignKey
ALTER TABLE "patient" DROP CONSTRAINT "patient_accountId_fkey";

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DOCTOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
