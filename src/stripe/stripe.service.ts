import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  public readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
  });

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  ): Promise<Stripe.Checkout.Session> {
    if (!process.env.STRIPE_SUCCESS_URL || !process.env.STRIPE_CANCEL_URL) {
      throw new Error(
        "Stripe success or cancel URL not configured in environment variables.",
      );
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        mode: "payment",
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
      });
      return session;
    } catch (error) {
      console.error("Error creating Stripe Checkout Session:", error);
      throw new Error(
        `Stripe Checkout Session creation failed: ${error.message}`,
      );
    }
  }
}
