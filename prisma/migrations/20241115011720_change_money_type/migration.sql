/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
