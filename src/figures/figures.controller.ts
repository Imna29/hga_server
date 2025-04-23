import { Controller, Get, Param } from "@nestjs/common";
import { FiguresService } from "./figures.service";
import { User } from "decorators/user.decorator";
import { Public } from "src/auth/auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("figures")
export class FiguresController {
  constructor(
    private readonly figuresService: FiguresService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  async getFigures(@User() userId: string) {
    return this.figuresService.getFigures(userId);
  }

  @Get(":figureId")
  async getFigure(@User() userId: string, @Param("figureId") figureId: string) {
    return this.figuresService.getFigure(userId, figureId);
  }

  @Get("certificate/:serialNumber")
  @Public()
  async getFigureCertificate(@Param("serialNumber") serialNumber: number) {
    return this.prismaService.piece.findUnique({
      where: {
        serialNumber,
      },
      select: {
        certificate: true,
      },
    });
  }
}
