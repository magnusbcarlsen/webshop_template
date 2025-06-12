import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    @Inject('STRIPE_WEBHOOK_SECRET') private readonly webhookSecret: string,
  ) {}

  /**
   * Create a Stripe Checkout Session
   * @param lineItems Stripe line items array
   * @param successUrl URL to redirect on successful payment
   * @param cancelUrl URL to redirect on payment cancellation
   */
  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  /**
   * Verify and construct a Stripe Webhook event
   * @param payload Raw request body as Buffer
   * @param signature Header signature from Stripe
   */
  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }
}
