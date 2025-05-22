// src/carts/carts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepo: Repository<Cart>,
  ) {}

  async create(dto: CreateCartDto): Promise<Cart> {
    const cart = this.cartsRepo.create({
      user: dto.userId ? { id: dto.userId } : undefined,
      sessionId: dto.sessionId,
      items: dto.items.map((i) => ({
        product: { id: i.productId },
        variant: i.variantId ? { id: i.variantId } : undefined,
        quantity: i.quantity || 1,
      })),
    });
    return this.cartsRepo.save(cart);
  }

  findAll(): Promise<Cart[]> {
    return this.cartsRepo.find({
      relations: ['items', 'items.product', 'items.variant'],
    });
  }

  async findBySession(sessionId: string): Promise<Cart> {
    const cart = await this.cartsRepo.findOne({
      where: { sessionId },
      relations: ['items', 'items.product', 'items.variant'],
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async createEmpty(): Promise<Cart> {
    const cart = this.cartsRepo.create({ items: [] });
    return this.cartsRepo.save(cart);
  }

  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartsRepo.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
          variant: true,
        },
      },
    });
    if (!cart) throw new NotFoundException(`Cart ${id} not found`);
    return cart;
  }

  async update(id: number, dto: UpdateCartDto): Promise<Cart> {
    await this.cartsRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cartsRepo.delete(id);
  }

  async addItemToCart(cartId: number, dto: AddCartItemDto): Promise<Cart> {
    const cart = await this.findOne(cartId);
    const { productId, variantId, quantity = 1 } = dto;

    const existing = cart.items.find(
      (i) =>
        i.product.id === productId &&
        (i.variant?.id ?? null) === (variantId ?? null),
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      const item = {
        product: { id: productId },
        variant: variantId ? { id: variantId } : undefined,
        quantity,
      };
      cart.items.push(item as any);
    }
    return this.cartsRepo.save(cart);
  }
}
