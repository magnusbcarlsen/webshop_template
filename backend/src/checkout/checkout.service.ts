// src/checkout/checkout.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '@/products/products.service';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly productsService: ProductsService, // renamed from productService
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY must be set in env');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  /**
   * Create a Stripe Checkout Session for a guest user based on items passed in.
   * Each item must be { productId: number; quantity: number }.
   * We fetch each product server‐side to get the current price, name, and image.
   */
  async createGuestCheckoutSession(
    items: { productId: number; quantity: number }[],
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('No items provided for checkout.');
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const { productId, quantity } = item;
      if (quantity < 1) {
        throw new BadRequestException(
          `Invalid quantity for productId ${productId}.`,
        );
      }

      // ▶ FIX: use findOne(id: number) instead of findBySlug
      const product = await this.productsService.findOne(productId);
      // └– findOne returns a Product entity or throws NotFoundException

      line_items.push({
        price_data: {
          currency: 'usd', // or your store currency
          product_data: {
            name: product.name,
            ...(product.images?.length
              ? { images: [product.images[0].imageUrl] }
              : {}),
          },
          unit_amount: Math.round(product.price * 100), // price in cents
        },
        quantity,
      });
    }

    // Create the Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${this.config.get<string>(
        'FRONTEND_URL',
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get<string>(
        'FRONTEND_URL',
      )}/checkout?canceled=true`,
    });

    return { sessionId: session.id };
  }
}
