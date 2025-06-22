// backend/src/orders/entities/order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id' })
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Make product nullable since Stripe items might not map to DB products
  @ManyToOne(() => Product, { eager: false, nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  // Product variants relation
  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  // Stripe integration
  @Column({
    name: 'stripe_price_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePriceId: string;

  // Add these new columns to store Stripe product information when DB product is not found
  @Column({
    name: 'stripe_product_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeProductName?: string;

  @Column({
    name: 'sku',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  sku?: string;

  // Computed field for subtotal getter (if you want to keep the old logic)
  get computedSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}
