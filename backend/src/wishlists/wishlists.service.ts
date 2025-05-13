import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly itemsRepo: Repository<WishlistItem>,
  ) {}

  async create(dto: CreateWishlistDto): Promise<Wishlist> {
    const wishlist = this.wishlistsRepo.create({
      user: { id: dto.userId } as Partial<User>,
      name: dto.name,
    });
    return this.wishlistsRepo.save(wishlist);
  }

  findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepo.find({
      relations: ['user', 'items', 'items.product'],
    });
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
    if (!wishlist) throw new NotFoundException(`Wishlist ${id} not found`);
    return wishlist;
  }

  async update(id: number, dto: UpdateWishlistDto): Promise<Wishlist> {
    await this.wishlistsRepo.update(id, { name: dto.name });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.wishlistsRepo.delete(id);
  }

  async addItem(id: number, dto: AddWishlistItemDto): Promise<Wishlist> {
    const item = this.itemsRepo.create({
      wishlist: { id } as Partial<Wishlist>,
      product: { id: dto.productId } as Partial<
        import('../products/entities/product.entity').Product
      >,
    });
    await this.itemsRepo.save(item);
    return this.findOne(id);
  }

  async removeItem(id: number, productId: number): Promise<void> {
    await this.itemsRepo.delete({ wishlistId: id, productId });
  }
}
