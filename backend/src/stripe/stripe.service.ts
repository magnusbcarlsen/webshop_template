// backend/src/stripe/stripe.service.ts
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
      // Collect customer details for order creation
      customer_creation: 'always',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['DK', 'SE', 'NO', 'DE', 'NL'],
      },
    });
  }

  /**
   * Retrieve a checkout session with line items
   * @param sessionId The checkout session ID
   */
  async retrieveSessionWithLineItems(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
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

  /**
   * Create a checkout session with product metadata for easier order creation
   * @param products Array of products with IDs and quantities
   * @param successUrl Success URL
   * @param cancelUrl Cancel URL
   */
  async createCheckoutSessionWithProducts(
    products: Array<{
      productId: number;
      quantity: number;
      name: string;
      price: number;
      image?: string;
    }>,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: 'dkk',
        product_data: {
          name: product.name,
          images: product.image ? [product.image] : [],
          metadata: {
            productId: product.productId.toString(),
          },
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
        metadata: {
          productId: product.productId.toString(),
        },
      },
      quantity: product.quantity,
    }));

    return this.createCheckoutSession(lineItems, successUrl, cancelUrl);
  }
}
