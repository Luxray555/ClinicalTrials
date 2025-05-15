-- DropForeignKey
ALTER TABLE "patient" DROP CONSTRAINT "patient_doctorId_fkey";

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
