import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['images', 'variants', 'category'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: ['images', 'variants', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug, isActive: true },
      relations: ['images', 'variants', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    try {
      return await this.productsRepository.save(product);
    } catch (err: unknown) {
      if (err instanceof QueryFailedError) {
        // narrow driverError into a typed object
        const driverErr = err.driverError as {
          code: string;
          sqlMessage: string;
        };
        if (
          driverErr.code === 'ER_DUP_ENTRY' &&
          driverErr.sqlMessage.includes('products.slug')
        ) {
          throw new ConflictException('Name must be unique');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const merged = this.productsRepository.merge(product, updateProductDto);
    try {
      return await this.productsRepository.save(merged);
    } catch (err: unknown) {
      if (err instanceof QueryFailedError) {
        const driverErr = err.driverError as {
          code: string;
          sqlMessage: string;
        };
        if (
          driverErr.code === 'ER_DUP_ENTRY' &&
          driverErr.sqlMessage.includes('products.slug')
        ) {
          throw new ConflictException('Name must be unique');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
