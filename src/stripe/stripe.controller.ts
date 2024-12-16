import {
  BadRequestException,
  Body,
  Controller,
  Headers,
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
    const order = await this.prismaService.order.findFirst({
      where: {
        id: createCheckoutSessionDto.orderId,
      },
    });

    const count = await this.prismaService.piece.count({
      where: {
        orderId: createCheckoutSessionDto.orderId,
      },
    });

    let session: Stripe.Response<Stripe.Checkout.Session>;

    if (order.serviceType === "BULK") {
      session = await this.stripeService.createCheckoutSession([
        {
          price: "price_1QDZ9LCkQycn6ct2d3KmQbux",
          quantity: count,
        },
      ]);
    } else if (order.serviceType === "CORE") {
      session = await this.stripeService.createCheckoutSession([
        {
          price: "price_1QDZ8RCkQycn6ct23JF7wYaH",
          quantity: count,
        },
      ]);
    } else if (order.serviceType === "ECONOMY") {
      session = await this.stripeService.createCheckoutSession([
        {
          price: "price_1QDZ7fCkQycn6ct2N08UY1Ka",
          quantity: count,
        },
      ]);
    }

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
