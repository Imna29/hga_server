import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "@prisma/client";
import { User } from "decorators/user.decorator";

@Controller("orders/stats")
export class StatsController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get("active-count")
  async getActiveOrdersCount(@User() userId: string) {
    return this.prismaService.order.count({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            AND: [
              {
                NOT: {
                  status: OrderStatus.SHIPPED_BACK,
                },
              },
              {
                NOT: {
                  status: OrderStatus.PENDING_PAYMENT,
                },
              },
            ],
          },
        ],
      },
    });
  }

  @Get("completed-count")
  async getCompletedOrdersCount(@User() userId: string) {
    return this.prismaService.order.count({
      where: {
        userId: userId,
        status: OrderStatus.SHIPPED_BACK,
      },
    });
  }

  @Get("figures-count")
  async getFiguresCount(@User() userId: string) {
    return this.prismaService.piece.count({
      where: {
        userId: userId,
        order: {
          AND: [
            {
              userId: userId,
            },
            {
              AND: [
                {
                  NOT: {
                    status: OrderStatus.PENDING_PAYMENT,
                  },
                },
              ],
            },
          ],
        },
      },
    });
  }

  @Get("average-grade")
  async getAverageGrade(@User() userId: string) {
    const pieces = await this.prismaService.piece.aggregate({
      _avg: {
        grade: true,
      },
      where: {
        userId: userId,
      },
    });

    return pieces._avg.grade || 0;
  }

  @Get("pending-count")
  async getPendingCount(@User() userId: string) {
    return this.prismaService.order.count({
      where: {
        userId,
        status: OrderStatus.PENDING_PAYMENT,
      },
    });
  }
}
