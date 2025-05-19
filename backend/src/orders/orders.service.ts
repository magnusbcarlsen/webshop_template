import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Fetch all, optionally including soft-deleted
  findAll(withDeleted = false): Promise<Order[]> {
    return this.orderRepository.find({
      withDeleted,
      relations: ['items', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number): Promise<Order> {
    return this.orderRepository.findOneOrFail({
      where: { id },
      relations: ['items', 'statusHistory'],
    });
  }

  create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(dto);
    return this.orderRepository.save(order);
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    await this.orderRepository.update(id, dto);
    return this.findOne(id);
  }

  // Soft-delete
  remove(id: number): Promise<UpdateResult> {
    return this.orderRepository.softDelete(id);
  }

  // Restore soft-deleted
  restore(id: number): Promise<UpdateResult> {
    return this.orderRepository.restore(id);
  }
}
