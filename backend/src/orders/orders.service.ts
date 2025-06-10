// src/orders/orders.service.ts

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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
      relations: ['items', 'statusHistory'],
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
      relations: ['items', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── ADMIN: Fetch any order by numeric ID ───────────────────────
  findOne(id: number): Promise<Order> {
    return this.orderRepository.findOneOrFail({
      where: { id },
      relations: ['items', 'statusHistory'],
    });
  }

  // ─── ADMIN: Update an order ────────────────────────────────────
  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    await this.orderRepository.update(id, dto);
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
}
