import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import CreateCheckoutSessionDto from "./dto/create-checkout-session.dto";
import { StripeService } from "./stripe.service";
import { PrismaService } from "../prisma/prisma.service";
import Stripe from "stripe";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { Request } from "express";
import { Public } from "src/auth/auth.guard";
import { SERVICE_DETAILS_MAP } from "../utils/pricing";

@Controller("stripe")
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post("checkout-session")
  async createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: createCheckoutSessionDto.orderId,
      },
      include: {
        pieces: true,
      },
    });

    if (order === null) throw new NotFoundException("Order not found");
    if (!order.pieces || order.pieces.length === 0) {
      throw new BadRequestException("Order must contain at least one piece.");
    }

    const serviceDetails = SERVICE_DETAILS_MAP[order.serviceType];
    if (!serviceDetails) {
      throw new BadRequestException(
        `Invalid service type: ${order.serviceType}`,
      );
    }

    const count = await this.prismaService.piece.count({
      where: {
        orderId: createCheckoutSessionDto.orderId,
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    line_items.push({
      price: serviceDetails.priceId,
      quantity: order.pieces.length,
    });
    if (serviceDetails.commissionRate) {
      let totalCommissionAmount = 0;
      for (const piece of order.pieces) {
        totalCommissionAmount += Math.round(
          piece.declaredValue * serviceDetails.commissionRate,
        );
      }

      if (totalCommissionAmount > 0) {
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Declared Value Commission (${
                serviceDetails.commissionRate * 100
              }%)`,
              description: `Commission based on total declared value for ${order.pieces.length} items.`,
            },
            unit_amount: totalCommissionAmount,
          },
          quantity: 1,
        });
      }
    }

    const session = await this.stripeService.createCheckoutSession(line_items);

    await this.prismaService.payment.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        stripeSessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: PaymentStatus.UNPAID,
      },
      create: {
        orderId: order.id,
        amount: session.amount_total,
        currency: session.currency,
        status: PaymentStatus.UNPAID,
        stripeSessionId: session.id,
      },
    });

    return session.url;
  }

  @Public()
  @Post("webhook")
  async stripeWebhook(
    @Headers("stripe-signature") sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    let event: Stripe.Event;
    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WH_SECRET,
      );
    } catch (err) {
      console.log(err);
      throw new BadRequestException("Webhook Error");
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const payment = await this.prismaService.payment.findFirst({
          where: {
            stripeSessionId: session.id,
          },
        });

        if (!payment) {
          console.log("Payment not found");
          throw new BadRequestException("Payment not found");
        }

        await this.prismaService.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status:
              session.payment_status === "paid" ||
              session.payment_status === "no_payment_required"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            amount: session.amount_total,
            currency: session.currency,
          },
        });

        await this.prismaService.order.update({
          where: {
            id: payment.orderId,
          },
          data: {
            status:
              session.payment_status === "paid" ||
              session.payment_status === "no_payment_required"
                ? OrderStatus.AWAITING_SHIPMENT
                : OrderStatus.PENDING_PAYMENT,
          },
        });

        if (
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required"
        ) {
          await this.prismaService.statusTracking.create({
            data: {
              status: "Payment received!",
              description:
                "Your payment has been received. We are now waiting for your figures to be shipped to us.",
              orderId: payment.orderId,
            },
          });
        }
        break;
      default:
        break;
    }
  }
}
