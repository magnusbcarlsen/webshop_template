// backend/src/orders/entities/order-status-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../users/entities/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  id: number;

  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string;

  // Reference to the user who made the change (admin user)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
