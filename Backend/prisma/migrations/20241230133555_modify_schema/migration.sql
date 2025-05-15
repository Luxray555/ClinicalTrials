/*
  Warnings:

  - You are about to drop the column `email` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');

-- DropIndex
DROP INDEX "admin_email_key";

-- DropIndex
DROP INDEX "doctor_email_key";

-- DropIndex
DROP INDEX "patient_email_key";

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patient" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "accountId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DOCTOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accountId_key" ON "admin"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_accountId_key" ON "doctor"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_accountId_key" ON "patient"("accountId");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
