// src/carts/entities/cart.entity.ts
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'cart_id', unsigned: true })
  id: number;

  // @ManyToOne(() => User, (user) => user.carts, {
  //   nullable: true,
  //   onDelete: 'SET NULL',
  // })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    type: 'uuid',
    unique: true,
    name: 'session_id',
    length: 255,
    nullable: true,
  })
  sessionId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
  @BeforeInsert()
  generateSession() {
    this.sessionId ??= uuidv4();
  }
}
