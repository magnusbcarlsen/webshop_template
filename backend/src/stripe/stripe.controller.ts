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
import rawBodyMiddleware from 'raw-body';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
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

  // Webhook endpoint listens raw body:
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    const secret = this.config.get('WEBHOOK_SECRET');
    const buf = (await rawBodyMiddleware(req)) as Buffer;
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(buf, sig);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: update your MySQL order table with session.payment_status, session.id, etc.
    }

    res.json({ received: true });
  }
}
