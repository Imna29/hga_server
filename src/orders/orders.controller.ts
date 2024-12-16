import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { User } from "decorators/user.decorator";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() order: CreateOrderDto, @User() userId: string) {
    return this.ordersService.createOrder(order, userId);
  }

  @Get()
  async getOrders(@User() userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @Post(":orderId/item")
  @UseInterceptors(FilesInterceptor("images"))
  async addItemToOrder(
    @Body() item: CreateOrderItemDto,
    @User() userId: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Param("orderId") orderId: string,
  ) {
    return this.ordersService.addItemToOrder(item, userId, images, orderId);
  }

  @Get(":orderId/status-updates")
  async getStatusUpdates(
    @Param("orderId") orderId: string,
    @User() userId: string,
  ) {
    return this.ordersService.getStatusUpdates(orderId, userId);
  }

  @Get("status-updates/latest")
  async getLatestStatusUpdates(@User() userId: string) {
    return this.ordersService.getLatestStatusUpdates(userId);
  }

  @Get(":orderId/pieces")
  async getOrderPieces(
    @User() userId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.ordersService.getOrderPieces(userId, orderId);
  }

  @Get(":orderId")
  async getOrder(@User() userId: string, @Param("orderId") orderId: string) {
    return this.ordersService.getOrder(userId, orderId);
  }
}
