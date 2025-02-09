import { Controller, Get, Param } from "@nestjs/common";
import { FiguresService } from "./figures.service";
import { User } from "decorators/user.decorator";

@Controller("figures")
export class FiguresController {
  constructor(private readonly figuresService: FiguresService) {}

  @Get()
  async getFigures(@User() userId: string) {
    return this.figuresService.getFigures(userId);
  }

  @Get(":figureId")
  async getFigure(@User() userId: string, @Param("figureId") figureId: string) {
    return this.figuresService.getFigure(userId, figureId);
  }
}
