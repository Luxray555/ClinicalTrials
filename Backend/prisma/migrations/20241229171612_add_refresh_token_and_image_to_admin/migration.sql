-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "image" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT;
