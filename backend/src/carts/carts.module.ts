import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controllor';


@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem])],
  providers: [CartsService],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
