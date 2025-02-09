import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../s3/s3.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { createId } from "@paralleldrive/cuid2";
import { extname } from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Piece } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createOrder(order: CreateOrderDto, userId: string) {
    return this.prismaService.order.create({
      data: {
        userId: userId,
        serviceType: order.type,
        statusTracking: {
          create: {
            status: "Order has been created",
            description: "Your order has been created and is awaiting payment",
          },
        },
      },
    });
  }

  async getOrders(userId: string) {
    return this.prismaService.order.findMany({
      where: {
        userId,
      },
      include: {
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

  async addItemToOrder(
    item: CreateOrderItemDto,
    userId: string,
    images: Express.Multer.File[],
    orderId: string,
  ) {
    const order = await this.prismaService.order.findFirst({
      where: {
        userId: userId,
        id: orderId,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const processedImages = await this.uploadImages(images);

    return this.prismaService.order.update({
      where: {
        id: order.id,
      },
      data: {
        pieces: {
          create: {
            name: item.name,
            userId: userId,
            description: item.description,
            images: processedImages,
          },
        },
      },
    });
  }

  private async uploadImages(images: Express.Multer.File[]): Promise<string[]> {
    const uploadedFilenames: string[] = [];

    for (const image of images) {
      const uniqueSuffix = createId();
      const filename = `${image.fieldname}-${uniqueSuffix}${extname(image.originalname)}`;
      await this.s3Service.uploadFile("figure-images", filename, image.buffer);
      uploadedFilenames.push(filename);
    }

    return uploadedFilenames;
  }

  async getStatusUpdates(orderId: string, userId: string) {
    return this.prismaService.statusTracking.findMany({
      where: {
        orderId,
        order: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getLatestStatusUpdates(userId: string) {
    return this.prismaService.statusTracking.findMany({
      where: {
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  }

  async getOrderPieces(userId: string, orderId: string) {
    const pieces = await this.prismaService.piece.findMany({
      where: {
        orderId,
        userId,
      },
    });

    return this.generateSignedUrls(pieces);
  }

  private async generateSignedUrls(pieces: Piece[]) {
    for (const piece of pieces) {
      const signedUrls = await Promise.all(
        piece.images.map(async (imageKey: string) => {
          const command = new GetObjectCommand({
            Bucket: "figure-images",
            Key: imageKey,
          });
          return getSignedUrl(this.s3Service.client, command, {
            expiresIn: 3600,
          });
        }),
      );
      piece.images = signedUrls;
    }
    return pieces;
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
        pieces: true,
        statusTracking: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            pieces: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.pieces.length > 0) {
      order.pieces = await this.generateSignedUrls(order.pieces);
    }

    return order;
  }
}
