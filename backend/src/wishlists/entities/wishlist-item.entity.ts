import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Product } from '@/products/entities/product.entity';

@Entity('wishlist_items')
export class WishlistItem extends BaseEntity {
  @PrimaryColumn({ name: 'wishlist_id', unsigned: true })
  wishlistId: number;

  @PrimaryColumn({ name: 'product_id', unsigned: true })
  productId: number;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}
