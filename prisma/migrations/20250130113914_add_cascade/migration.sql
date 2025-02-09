-- DropForeignKey
ALTER TABLE "StatusTracking" DROP CONSTRAINT "StatusTracking_orderId_fkey";

-- AddForeignKey
ALTER TABLE "StatusTracking" ADD CONSTRAINT "StatusTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
