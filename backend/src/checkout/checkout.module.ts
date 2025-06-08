// src/checkout/checkout.module.ts

import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { ConfigModule } from '@nestjs/config';

import { ProductsModule } from '@/products/products.module';

@Module({
  imports: [ConfigModule, ProductsModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
