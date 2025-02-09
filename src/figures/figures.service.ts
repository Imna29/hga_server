import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../s3/s3.service";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Piece } from "@prisma/client";

@Injectable()
export class FiguresService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getFigures(userId: string) {
    const figures = await this.prismaService.piece.findMany({
      where: {
        userId,
      },
      include: {
        order: {
          select: {
            status: true,
            serviceType: true,
          },
        },
      },
    });

    return this.generateSignedUrls(figures);
  }

  async getFigure(userId: string, figureId: string) {
    const figure = await this.prismaService.piece.findFirst({
      where: {
        id: figureId,
        userId,
      },
      include: {
        order: {
          select: {
            status: true,
            serviceType: true,
            statusTracking: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!figure) {
      throw new Error("Figure not found");
    }

    const figuresWithSignedUrls = await this.generateSignedUrls([figure]);
    return figuresWithSignedUrls[0];
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
