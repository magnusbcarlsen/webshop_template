// backend/src/stripe/stripe.controller.ts
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

@Controller('stripe') // NO /api prefix - nginx handles this
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
    console.log('🛍️ Creating checkout session...');
    try {
      const lineItems = body.items.map((i) => ({
        price: i.priceId,
        quantity: i.quantity,
      }));
      const session = await this.stripeService.createCheckoutSession(
        lineItems,
        `${this.config.get('FRONTEND_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
        `${this.config.get('FRONTEND_URL')}/cancel`,
      );
      console.log('✅ Checkout session created:', session.id);
      return { id: session.id };
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      throw error;
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    console.log('🔔 Webhook received!');

    try {
      const secret = this.config.get('WEBHOOK_SECRET');
      if (!secret) {
        console.error('❌ WEBHOOK_SECRET not configured');
        res.status(500).send('Webhook secret not configured');
        return;
      }

      console.log('📦 Reading request body...');

      // The raw middleware gives us the body as a Buffer directly
      const body = req.body as Buffer;
      if (!body || !Buffer.isBuffer(body)) {
        console.error('❌ No raw body found in request');
        console.log('Request body type:', typeof req.body);
        res.status(400).send('No raw body found');
        return;
      }

      console.log('✅ Raw body found, size:', body.length);

      let event: Stripe.Event;

      try {
        event = this.stripeService.constructEvent(body, sig);
        console.log('✅ Webhook signature verified');
        console.log('Event type:', event.type);
        console.log('Event ID:', event.id);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed':
            console.log('🛒 Processing checkout session completed');
            await this.handleCheckoutCompleted(
              event.data.object as Stripe.Checkout.Session,
            );
            console.log('✅ Checkout session processed successfully');
            break;
          case 'checkout.session.expired':
            console.log('⏰ Checkout session expired:', event.data.object.id);
            break;
          default:
            console.log(`❓ Unhandled event type: ${event.type} - ignoring`);
        }
      } catch (error) {
        console.error('❌ Error processing webhook event:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).send(`Webhook processing failed: ${error.message}`);
        return;
      }

      console.log('✅ Webhook processed successfully');
      res.status(200).send('OK');
    } catch (error) {
      console.error('💥 Fatal webhook error:', error);
      res.status(500).send(`Fatal webhook error: ${error.message}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log('🔄 Processing completed checkout session:', session.id);

    try {
      // Check if order already exists
      console.log('🔍 Checking for existing order...');
      const existingOrder = await this.ordersService.findByStripeSessionId(
        session.id,
      );
      if (existingOrder) {
        console.log('⚠️ Order already exists for session:', session.id);
        return existingOrder;
      }

      // Retrieve the session with line items
      console.log('📋 Retrieving session with line items...');
      const sessionWithLineItems =
        await this.stripeService.retrieveSessionWithLineItems(session.id);

      if (!sessionWithLineItems.line_items?.data) {
        throw new Error('No line items found in session');
      }

      console.log(
        '📦 Line items found:',
        sessionWithLineItems.line_items.data.length,
      );

      // Extract customer details
      const customerDetails = sessionWithLineItems.customer_details;
      if (!customerDetails) {
        throw new Error('No customer details found in session');
      }

      console.log(
        '👤 Customer details found:',
        customerDetails.name,
        customerDetails.email,
      );

      // Calculate totals (Stripe amounts are in cents)
      const subtotal = (sessionWithLineItems.amount_subtotal || 0) / 100;
      const totalAmount = (sessionWithLineItems.amount_total || 0) / 100;
      const taxAmount =
        (sessionWithLineItems.total_details?.amount_tax || 0) / 100;
      const shippingAmount =
        (sessionWithLineItems.total_details?.amount_shipping || 0) / 100;

      console.log('💰 Order totals:', {
        subtotal,
        totalAmount,
        taxAmount,
        shippingAmount,
      });

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
        shippingAddress: this.formatAddress(
          customerDetails.address,
          'shipping',
        ),
        billingAddress: this.formatAddress(customerDetails.address, 'billing'),
        paymentMethod: sessionWithLineItems.payment_method_types?.[0] || 'card',
        status: OrderStatus.PENDING as const,
        items: sessionWithLineItems.line_items.data.map((item, index) => {
          console.log(`📝 Processing item ${index + 1}:`, {
            description: item.description,
            quantity: item.quantity,
            amount_total: item.amount_total,
            price_id: item.price?.id,
          });
          return {
            productId: this.extractProductIdFromStripeItem(item),
            quantity: item.quantity || 1,
            unitPrice: (item.amount_total || 0) / 100 / (item.quantity || 1),
            stripePriceId: item.price?.id || '',
          };
        }),
      };

      console.log(
        '📝 Creating order with data:',
        JSON.stringify(orderData, null, 2),
      );

      // Create the order using a special method that doesn't require sessionId cookie
      const createdOrder =
        await this.ordersService.createFromStripeWebhook(orderData);

      console.log('🎉 Order created successfully! Order ID:', createdOrder.id);
      return createdOrder;
    } catch (error) {
      console.error('💥 Failed to create order from Stripe session:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
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

  private extractProductIdFromStripeItem(item: Stripe.LineItem): number {
    const metadata = item.price?.metadata;
    if (metadata?.productId) {
      console.log('📊 Found product ID in metadata:', metadata.productId);
      return parseInt(metadata.productId, 10);
    }

    const product = item.price?.product;
    if (
      typeof product === 'object' &&
      product &&
      'metadata' in product &&
      product.metadata?.productId
    ) {
      console.log(
        '📊 Found product ID in product metadata:',
        product.metadata.productId,
      );
      return parseInt(product.metadata.productId, 10);
    }

    console.warn(
      '⚠️ Could not extract product ID from Stripe item, using fallback',
    );
    console.log('Item details:', {
      priceId: item.price?.id,
      productName:
        typeof product === 'object' && product && 'name' in product
          ? product.name
          : 'N/A',
      metadata: metadata,
    });
    return 1;
  }
}
