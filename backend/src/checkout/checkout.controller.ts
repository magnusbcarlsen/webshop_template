// src/checkout/checkout.controller.ts

import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Accepts JSON: { items: { productId: number; quantity: number }[] }
   * Returns { sessionId }.
   */
  @Post('create-session')
  async createSession(
    @Body()
    body: {
      items?: { productId: number; quantity: number }[];
    },
  ) {
    if (!body.items) {
      throw new BadRequestException('Missing items in request body.');
    }
    const { sessionId } = await this.checkoutService.createGuestCheckoutSession(
      body.items,
    );
    return { sessionId };
  }
}
