// backend/src/stripe/stripe.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Global() 
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (config: ConfigService) => {
        const secretKey = config.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
          throw new Error(
            'Environment variable STRIPE_SECRET_KEY is not defined',
          );
        }
        return new Stripe(secretKey, {
          apiVersion: '2025-05-28.basil',
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'STRIPE_WEBHOOK_SECRET',
      useFactory: (config: ConfigService) => {
        const whSecret = config.get<string>('WEBHOOK_SECRET');
        if (!whSecret) {
          throw new Error('Environment variable WEBHOOK_SECRET is not defined');
        }
        return whSecret;
      },
      inject: [ConfigService],
    },
    StripeService,
  ],
  controllers: [StripeController],
  exports: ['STRIPE_CLIENT', 'STRIPE_WEBHOOK_SECRET', StripeService],
})
export class StripeModule {}
