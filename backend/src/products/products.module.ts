import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { VariantsController } from './variants.controllor';
import { VariantsService } from './variants.service';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      ProductVariant,
      Attribute,
      AttributeValue,
    ]),
  ],
  controllers: [ProductsController, AttributesController, VariantsController],
  providers: [ProductsService, AttributesService, VariantsService],
  exports: [ProductsService, AttributesService, VariantsService],
})
export class ProductsModule {}
