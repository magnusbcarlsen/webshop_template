// src/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create({
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress,
      paymentMethod: dto.paymentMethod,
      items: dto.items.map((i) => ({
        product: { id: i.productId },
        quantity: i.quantity,
        // assume unitPrice & subtotal calculated elsewhere or fetched
      })),
    });
    // TODO: calculate subtotal, tax, shipping, discount, total
    return this.repo.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.repo.find({ relations: ['items', 'statusHistory'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.repo.findOne({
      where: { id },
      relations: ['items', 'statusHistory'],
    });

    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number): Promise<void> {
    return this.repo.delete(id).then(() => undefined);
  }
}
