import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminController } from './admin/admin.controller';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get('DB_HOST'),
        port: +cfg.get<number>('DB_PORT', 3306),
        username: cfg.get('DB_USERNAME'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // or false in prod
      }),
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CategoriesModule,
    CartsModule,
  ],
  controllers: [AdminController], // ← add this line
})
export class AppModule {}
