// src/products/entities/product-image.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'image_id' })
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'image_url', length: 255 })
  imageUrl: string;

  @Column({ name: 'alt_text', length: 255, nullable: true })
  altText: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
