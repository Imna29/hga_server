import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { OrderStatus, Piece } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { S3Service } from "src/s3/s3.service";

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService, private readonly s3Service:S3Service) { }

  async getOrders() {
    return this.prismaService.order.findMany({
      include: {
        statusTracking: {
          orderBy: {
            createdAt: "desc",
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
        _count: {
          select: {
            pieces: true,
          },
        },
      },
    });
  }

  async getOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      include: {
        pieces: {
          orderBy:{
            createdAt: "desc",
          }
        },
        statusTracking: {
          orderBy: {
            createdAt: "desc",
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
        _count: {
          select: {
            pieces: true,
          },
        },
      },
    });

    order.pieces = await this.generateSignedUrls(order.pieces);

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async addStatusUpdate(id: string, status: string, description: string, trackingCode: string) {
    return this.prismaService.statusTracking.create({
      data: {
        orderId: id,
        status,
        description,
        trackingCode,
      },
    });
  }

  async updatePieceGrade(id: string, grade: number, isPristine: boolean) {
    return this.prismaService.piece.update({
      where: {
        id,
      },
      data: {
        grade,
        isPristine,
      },
    });
  }

  private async generateSignedUrls(figures: Piece[]) {
    for (const figure of figures) {
      const signedUrls = await Promise.all(
        figure.images.map(async (imageKey: string) => {
          const command = new GetObjectCommand({
            Bucket: "figure-images",
            Key: imageKey,
          });
          return getSignedUrl(this.s3Service.client, command, {
            expiresIn: 3600,
          });
        }),
      );
      figure.images = signedUrls;
    }
    return figures;
  }
}
