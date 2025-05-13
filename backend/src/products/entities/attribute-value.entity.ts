import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Attribute } from './attribute.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('attribute_values')
export class AttributeValue extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'attribute_value_id', unsigned: true })
  id: number;

  @ManyToOne(() => Attribute, (attr) => attr.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @Column({ length: 100 })
  value: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // join table for products
  @ManyToMany(() => Product, (prod) => prod.attributes)
  products: Product[];

  // join table for variants
  @ManyToMany(() => ProductVariant, (v) => v.attributes)
  variants: ProductVariant[];
}
