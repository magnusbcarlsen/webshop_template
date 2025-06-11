// backend/src/stripe/stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';


@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) =>
        new Stripe(configService.get('STRIPE_SECRET_KEY'), {
          apiVersion: '2022-11-15',
        }),
      inject: [ConfigService],
    },
    StripeService,
  ],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
