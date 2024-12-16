/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `Piece` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Piece" ADD COLUMN     "serialNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Piece_serialNumber_key" ON "Piece"("serialNumber");
