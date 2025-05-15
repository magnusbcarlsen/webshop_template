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
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory, OrderStatus } from './order-status-history.entity';
import { User } from '@/users/entities/user.entity';
// import { User } from '../../users/entities/user.entity'; // uncomment when you add Users

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'order_id', unsigned: true })
  id: number;

  // — optional link to a user (future)
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // — always-populated guest info
  @Column({ name: 'guest_name', type: 'varchar', length: 100 })
  guestName: string;

  @Column({ name: 'guest_email', type: 'varchar', length: 320 })
  guestEmail: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'shipping_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingAmount: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'shipping_address', type: 'varchar', length: 500 })
  shippingAddress: string;

  @Column({ name: 'billing_address', type: 'varchar', length: 500 })
  billingAddress: string;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod?: string;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (hist) => hist.order, { cascade: true })
  statusHistory: OrderStatusHistory[];
}
