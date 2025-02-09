import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { S3Module } from "src/s3/s3.module";

@Module({
  providers: [AdminService],
  controllers: [AdminController],
  imports: [PrismaModule, S3Module],
})
export class AdminModule {}
