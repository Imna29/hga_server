import { Module } from "@nestjs/common";
import { FiguresController } from "./figures.controller";
import { FiguresService } from "./figures.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { S3Module } from "src/s3/s3.module";

@Module({
  controllers: [FiguresController],
  providers: [FiguresService],
  imports: [PrismaModule, S3Module],
})
export class FiguresModule {}
