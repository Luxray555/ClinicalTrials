/*
  Warnings:

  - You are about to drop the column `specialty` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "specialty",
ADD COLUMN     "speciality" VARCHAR(255);
