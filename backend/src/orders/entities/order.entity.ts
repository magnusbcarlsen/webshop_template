// backend/src/orders/entities/order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory, OrderStatus } from './order-status-history.entity';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  // Optional: User relation (for registered users)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Guest user info
  @Column({ name: 'guest_name', type: 'varchar', length: 320 })
  guestName: string;

  @Column({ name: 'guest_email', type: 'varchar', length: 150 })
  guestEmail: string;

  // Session tracking for guest orders
  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId: string;

  // Stripe integration
  @Column({
    name: 'stripe_session_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeSessionId: string;

  // Current status
  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Order amounts
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

  // Addresses
  @Column({ name: 'shipping_address', type: 'varchar', length: 500 })
  shippingAddress: string;

  @Column({ name: 'billing_address', type: 'varchar', length: 500 })
  billingAddress: string;

  // Payment and fulfillment
  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber: string;

  // Additional info
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relations
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, {
    cascade: true,
    eager: false,
  })
  statusHistory: OrderStatusHistory[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
