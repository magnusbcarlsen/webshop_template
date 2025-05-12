import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('order_status_history')
export class OrderStatusHistory extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'history_id', unsigned: true })
  id: number;

  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number; // you could later replace this with a User relation

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
