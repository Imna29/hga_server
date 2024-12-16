import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { S3Module } from "../s3/s3.module";
import { StatsController } from "./stats.controller";

@Module({
  controllers: [OrdersController, StatsController],
  providers: [OrdersService],
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    S3Module,
  ],
})
export class OrdersModule {}
