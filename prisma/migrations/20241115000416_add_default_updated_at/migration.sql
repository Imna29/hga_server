/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pieceId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StatusTracking` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `StatusTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'REQUIRES_ACTION', 'PROCESSING', 'REQUIRES_CAPTURE', 'CANCELED', 'SUCCEEDED');

-- CreateEnum
CREATE TYPE "Carrier" AS ENUM ('USPS', 'UPS', 'FEDEX', 'DHL', 'OTHER');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_pieceId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "Piece" DROP CONSTRAINT "Piece_userId_fkey";

-- DropIndex
DROP INDEX "Order_pieceId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentStatus",
DROP COLUMN "pieceId",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Piece" ADD COLUMN     "orderId" UUID,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StatusTracking" DROP COLUMN "updatedAt",
ADD COLUMN     "carrier" "Carrier",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "trackingCode" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- DropTable
DROP TABLE "User";

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
