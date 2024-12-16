import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(
    items: Array<{ price: string; quantity: number }>,
  ) {
    return await this.stripe.checkout.sessions.create({
      line_items: [
        ...items.map((item) => ({
          price: item.price,
          quantity: item.quantity,
          adjustable_quantity: {
            enabled: false,
          },
        })),
      ],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
  }
}
