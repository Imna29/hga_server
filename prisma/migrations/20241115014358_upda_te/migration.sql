/*
  Warnings:

  - Added the required column `serviceType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `orderId` on table `Piece` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ECONOMY', 'CORE', 'BULK');

-- DropForeignKey
ALTER TABLE "Piece" DROP CONSTRAINT "Piece_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "Piece" ALTER COLUMN "orderId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
