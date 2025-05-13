import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { AttributeValue } from './attribute-value.entity';
import { OrderItem } from '@/orders/entities/order-item.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'variant_id', unsigned: true })
  id: number;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 50, unique: true, nullable: true })
  sku?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salePrice?: number;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // join table for variant_attributes
  @ManyToMany(() => AttributeValue, (val) => val.variants, { cascade: true })
  @JoinTable({
    name: 'variant_attributes',
    joinColumn: { name: 'variant_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'attribute_value_id',
      referencedColumnName: 'id',
    },
  })
  attributes: AttributeValue[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  orderItems: OrderItem[];
}
