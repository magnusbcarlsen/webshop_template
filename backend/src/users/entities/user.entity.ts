// src/users/entities/user.entity.ts

import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../role.entity';
import { UserAddress } from './user-address.entity';
import { Order } from '../../orders/entities/order.entity';
import { CartItem } from '@/carts/entities/cart-item.entity';
import { Wishlist } from '@/wishlists/entities/wishlist.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User extends BaseEntity {
  // now called `id`, so `userEntity.id` works
  @PrimaryGeneratedColumn({ name: 'user_id', unsigned: true })
  id: number;

  // exactly `role_id` so `userEntity.role_id` compiles
  @Column({ name: 'role_id', type: 'int', unsigned: true })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ length: 320, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @OneToMany(() => UserAddress, (addr) => addr.user, { cascade: true })
  addresses: UserAddress[];

  // now matches your OrdersModule, and Optional in the DB
  // @OneToMany(() => Order, (order) => order.user, { cascade: true })
  // orders: Order[];
  // carts: CartItem[];
  @OneToMany(() => Wishlist, (wishlist) => wishlist.user, { cascade: true })
  wishlists: Wishlist[];
  // @OneToMany(() => CartItem, (cartItem) => cartItem.user, { cascade: true })
}
