/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `patient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_accountId_fkey";

-- DropForeignKey
ALTER TABLE "doctor" DROP CONSTRAINT "doctor_accountId_fkey";

-- DropForeignKey
ALTER TABLE "patient" DROP CONSTRAINT "patient_accountId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "refresh_token" TEXT;

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "refresh_token";

-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "refresh_token";

-- AlterTable
ALTER TABLE "patient" DROP COLUMN "refresh_token";

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
