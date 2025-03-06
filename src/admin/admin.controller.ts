import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Admin } from "src/auth/auth.guard";
import { OrderStatus } from "@prisma/client";

@Controller("admin")
@Admin()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("orders")
  async getOrders() {
    return this.adminService.getOrders();
  }

  @Get("orders/:id")
  async getOrder(@Param("id") id: string) {
    return this.adminService.getOrder(id);
  }

  @Patch("orders/:id/status")
  async updateOrderStatus(@Param("id") id: string, @Body() body: { status: OrderStatus }) {
    return this.adminService.updateOrderStatus(id, body.status);
  }

  @Post("orders/:id/status-update")
  async addStatusUpdate(@Param("id") id: string, @Body() body: { status: string, description: string, trackingCode: string }) {
    return this.adminService.addStatusUpdate(id, body.status, body.description, body.trackingCode);
  }

  @Patch("/figures/:id/grade")
  async updateGrade(@Param("id") id: string, @Body() body: { grade: number, isPristine: boolean }) {
    return this.adminService.updatePieceGrade(id, body.grade, body.isPristine);
  }
}
