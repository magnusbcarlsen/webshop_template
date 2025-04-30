import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';

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
        synchronize: true, // or false in prod
      }),
    }),
    ProductsModule, // ← make sure this is here
  ],
})
export class AppModule {}
