// src/categories/entities/category.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @Column({ name: 'parent_category_id', nullable: true })
  parentCategoryId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (cat) => cat.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: Category;

  @OneToMany(() => Category, (cat) => cat.parentCategory)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
