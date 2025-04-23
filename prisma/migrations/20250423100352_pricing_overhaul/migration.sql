/*
  Warnings:

  - The values [ECONOMY] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `declaredValue` to the `Piece` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('BULK', 'VALUE', 'CORE', 'PLUS', 'PREMIUM', 'ULTIMATE');
ALTER TABLE "Order" ALTER COLUMN "serviceType" TYPE "ServiceType_new" USING ("serviceType"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Piece" ADD COLUMN     "declaredValue" INTEGER NOT NULL;
