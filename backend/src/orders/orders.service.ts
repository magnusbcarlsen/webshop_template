// backend/src/orders/orders.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  OrderStatus,
  OrderStatusHistory,
} from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';

interface StripeOrderData {
  guestName: string;
  guestEmail: string;
  stripeSessionId: string;
  subtotal: number;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  status: OrderStatus;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    stripePriceId: string;
  }>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
  ) {}

  // ─── GUEST: Create a new order, tied to sessionId cookie ────────
  async createFromSession(
    req: Request,
    res: Response,
    dto: CreateOrderDto,
  ): Promise<Order> {
    // 1) Get or generate sessionId
    let sessionId = req.cookies.sessionId as string | undefined;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    // 2) Create order entity with sessionId
    const order = this.orderRepository.create({
      ...dto,
      sessionId,
    });

    return this.orderRepository.save(order);
  }

  // ─── NEW: Create order from Stripe webhook ────────────────────
  async createFromStripeWebhook(data: StripeOrderData): Promise<Order> {
    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if order already exists with this Stripe session ID
      const existingOrder = await queryRunner.manager.findOne(Order, {
        where: { stripeSessionId: data.stripeSessionId },
      });

      if (existingOrder) {
        console.log('Order already exists for session:', data.stripeSessionId);
        await queryRunner.commitTransaction();
        return existingOrder;
      }

      // Generate a session ID for this order (for guest tracking)
      const sessionId = uuidv4();

      // Create the order
      const order = queryRunner.manager.create(Order, {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        sessionId,
        stripeSessionId: data.stripeSessionId,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount,
        shippingAmount: data.shippingAmount,
        discountAmount: data.discountAmount,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        paymentMethod: data.paymentMethod,
        status: data.status,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      const orderItems = data.items.map((item) =>
        queryRunner.manager.create(OrderItem, {
          product: { id: item.productId } as Product, // TypeORM will handle the relation
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.unitPrice * item.quantity,
          stripePriceId: item.stripePriceId,
          order: savedOrder,
        }),
      );

      await queryRunner.manager.save(orderItems);

      // Create initial status history
      const statusHistory = queryRunner.manager.create(OrderStatusHistory, {
        order: savedOrder,
        status: data.status,
        comment: 'Order created from Stripe payment',
      });

      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();

      // Return the order with relations
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating order from Stripe webhook:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── GUEST: Fetch a single order only if it matches sessionId ────
  async findBySessionSecure(
    orderId: number,
    sessionId?: string,
  ): Promise<Order> {
    if (!sessionId) {
      throw new ForbiddenException('No sessionId provided');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, sessionId },
      relations: ['items', 'items.product', 'statusHistory'],
    });

    if (!order) {
      // Could be not found or belongs to another session
      throw new NotFoundException('Order not found for this session');
    }
    return order;
  }

  // ─── ADMIN: Fetch all orders (with optional soft-deleted) ───────
  findAll(withDeleted = false): Promise<Order[]> {
    return this.orderRepository.find({
      withDeleted,
      relations: ['items', 'items.product', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── ADMIN: Fetch any order by numeric ID ───────────────────────
  findOne(id: number): Promise<Order> {
    return this.orderRepository.findOneOrFail({
      where: { id },
      relations: ['items', 'items.product', 'items.variant', 'statusHistory'],
    });
  }

  // ─── ADMIN: Update an order ────────────────────────────────────
  async update(
    id: number,
    dto: UpdateOrderDto & { status?: OrderStatus; comment?: string },
  ): Promise<Order> {
    const order = await this.findOne(id);

    // If status is being updated, create a status history entry
    if (dto.status && dto.status !== order.status) {
      const statusHistory = this.orderStatusHistoryRepository.create({
        order: { id } as Order,
        status: dto.status,
        comment: dto.comment || `Status updated to ${dto.status}`,
      });
      await this.orderStatusHistoryRepository.save(statusHistory);
    }

    // Update the order
    const { comment, ...updateData } = dto;
    await this.orderRepository.update(id, updateData);

    return this.findOne(id);
  }

  // ─── ADMIN: Soft-delete an order ───────────────────────────────
  remove(id: number): Promise<UpdateResult> {
    return this.orderRepository.softDelete(id);
  }

  // ─── ADMIN: Restore a soft-deleted order ───────────────────────
  restore(id: number): Promise<UpdateResult> {
    return this.orderRepository.restore(id);
  }

  // ─── GUEST: Find order by Stripe session ID ────────────────────
  async findByStripeSessionId(stripeSessionId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { stripeSessionId },
      relations: ['items', 'items.product', 'statusHistory'],
    });
  }
}
