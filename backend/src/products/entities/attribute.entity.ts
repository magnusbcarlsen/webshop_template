import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { AttributeValue } from './attribute-value.entity';
import { Product } from './product.entity';

@Entity('attributes')
export class Attribute extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'attribute_id', unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => AttributeValue, (val) => val.attribute, { cascade: true })
  values: AttributeValue[];

  // join to products via `product_attributes`
  @ManyToMany(() => Product, (prod) => prod.attributes)
  products: Product[];
}
