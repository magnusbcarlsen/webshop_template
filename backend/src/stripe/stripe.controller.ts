// backend/src/stripe/stripe.controller.ts - Fixed version
import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';
import { OrderStatus } from '../orders/entities/order-status-history.entity';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly config: ConfigService,
  ) {}

  @Post('create-session')
  async createSession(
    @Body() body: { items: { priceId: string; quantity: number }[] },
  ) {
    const lineItems = body.items.map((i) => ({
      price: i.priceId,
      quantity: i.quantity,
    }));
    const session = await this.stripeService.createCheckoutSession(
      lineItems,
      `${this.config.get('FRONTEND_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${this.config.get('FRONTEND_URL')}/cancel`,
    );
    return { id: session.id };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    try {
      const secret = this.config.get<string>('WEBHOOK_SECRET');
      if (!secret) {
        res.status(500).send('Webhook secret not configured');
        return;
      }

      const body = req.body as Buffer;
      if (!body || !Buffer.isBuffer(body)) {
        res.status(400).send('No raw body found');
        return;
      }

      let event: Stripe.Event;

      try {
        event = this.stripeService.constructEvent(body, sig);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        res.status(400).send(`Webhook Error: ${errorMessage}`);
        return;
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed':
            await this.handleCheckoutCompleted(event.data.object);
            break;
          case 'checkout.session.expired':
            // Handle expired session if needed
            break;
          default:
            // Unhandled event type - ignore
            break;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Webhook processing failed: ${errorMessage}`);
        return;
      }

      res.status(200).send('OK');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).send(`Fatal webhook error: ${errorMessage}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // Check if order already exists
    const existingOrder = await this.ordersService.findByStripeSessionId(
      session.id,
    );
    if (existingOrder) {
      return existingOrder;
    }

    // Retrieve the session with line items
    const sessionWithLineItems =
      await this.stripeService.retrieveSessionWithLineItems(session.id);

    if (!sessionWithLineItems.line_items?.data) {
      throw new Error('No line items found in session');
    }

    // Extract customer details
    const customerDetails = sessionWithLineItems.customer_details;
    if (!customerDetails) {
      throw new Error('No customer details found in session');
    }

    // Calculate totals
    const subtotal = (sessionWithLineItems.amount_subtotal || 0) / 100;
    const totalAmount = (sessionWithLineItems.amount_total || 0) / 100;
    const taxAmount =
      (sessionWithLineItems.total_details?.amount_tax || 0) / 100;
    const shippingAmount =
      (sessionWithLineItems.total_details?.amount_shipping || 0) / 100;

    // Prepare order data
    const orderData = {
      guestName: customerDetails.name || 'Unknown Customer',
      guestEmail: customerDetails.email || '',
      stripeSessionId: session.id,
      subtotal,
      totalAmount,
      taxAmount,
      shippingAmount,
      discountAmount: 0,
      shippingAddress: this.formatAddress(customerDetails.address, 'shipping'),
      billingAddress: this.formatAddress(customerDetails.address, 'billing'),
      paymentMethod: sessionWithLineItems.payment_method_types?.[0] || 'card',
      status: OrderStatus.PENDING as const,
      items: sessionWithLineItems.line_items.data.map((item) => {
        const productId = this.extractProductIdFromStripeItem(item);

        return {
          productId: productId, // This can be null
          quantity: item.quantity || 1,
          unitPrice: (item.amount_total || 0) / 100 / (item.quantity || 1),
          stripePriceId: item.price?.id || '',
          // Store the Stripe product name as fallback
          stripeProductName: this.extractProductNameFromStripeItem(item),
          // Store the SKU if available
          sku: this.extractProductSkuFromStripeItem(item),
        };
      }),
    };

    // Create the order using a special method that doesn't require sessionId cookie
    const createdOrder =
      await this.ordersService.createFromStripeWebhook(orderData);

    return createdOrder;
  }

  private formatAddress(address: Stripe.Address | null, type: string): string {
    if (!address) {
      return `No ${type} address provided`;
    }

    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  private extractProductIdFromStripeItem(item: Stripe.LineItem): number | null {
    // First try to get from price metadata
    const priceMetadata = item.price?.metadata;
    if (priceMetadata?.productId) {
      const id = parseInt(priceMetadata.productId, 10);
      if (!isNaN(id)) {
        return id;
      }
    }

    // Then try to get from product metadata
    const product = item.price?.product;
    if (
      typeof product === 'object' &&
      product &&
      'metadata' in product &&
      product.metadata?.productId
    ) {
      const id = parseInt(product.metadata.productId, 10);
      if (!isNaN(id)) {
        return id;
      }
    }

    // Log warning and return null instead of defaulting to 1
    console.warn('No valid product ID found for Stripe item:', {
      priceId: item.price?.id,
      productName: this.extractProductNameFromStripeItem(item),
    });

    return null;
  }

  private extractProductNameFromStripeItem(item: Stripe.LineItem): string {
    // Try to get product name from the Stripe product
    const product = item.price?.product;

    if (typeof product === 'object' && product && 'name' in product) {
      return product.name || 'Unknown Product';
    }

    if (typeof product === 'string') {
      // If it's just a product ID string, we can't get the name easily
      return `Product ${product}`;
    }

    return 'Unknown Product';
  }

  private extractProductSkuFromStripeItem(
    item: Stripe.LineItem,
  ): string | undefined {
    // Try to get SKU from price metadata first
    const priceMetadata = item.price?.metadata;
    if (priceMetadata?.sku) {
      return priceMetadata.sku;
    }

    // Then try to get from product metadata
    const product = item.price?.product;
    if (
      typeof product === 'object' &&
      product &&
      'metadata' in product &&
      product.metadata?.sku
    ) {
      return product.metadata.sku;
    }

    return undefined;
  }
}
