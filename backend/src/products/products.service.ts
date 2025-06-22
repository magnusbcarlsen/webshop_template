// products.service.ts

import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Category } from '@/categories/entities/category.entity';
import { ConfigService } from '@nestjs/config';

// Proper multer type imports
import { Express } from 'express';
import 'multer';
import Stripe from 'stripe';

async function ensureBucketExists(s3Client: S3Client, bucketName: string) {
  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket ${bucketName} created successfully`);
  } catch (error) {
    if (error.name !== 'BucketAlreadyOwnedByYou') {
      console.error('Error creating bucket:', error);
    }
  }
}

@Injectable()
export class ProductsService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject('S3')
    private readonly s3Client: S3Client,
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates and uploads a file to S3/Spaces, returning a browser-accessible URL
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    // Validate file
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const bucket = this.configService.get<string>('do_spaces_bucket')!;
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;

    // Don't add extra path prefix - just use the filename
    const key = filename;

    // Ensure bucket exists (optional)
    await ensureBucketExists(this.s3Client, bucket);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
          CacheControl: 'max-age=31536000', // 1 year cache
        }),
      );
    } catch (err) {
      console.error('S3 Upload Error:', err);
      throw new InternalServerErrorException('Failed to upload image');
    }

    // Build the correct URL format
    const apiHost =
      this.configService.get<string>('MINIO_API_HOST') || 'localhost';
    const apiPort = this.configService.get<string>('MINIO_API_PORT') || '9000';

    // Return the correct MinIO URL format
    return `http://${apiHost}:${apiPort}/${bucket}/${key}`;
  }

  /**
   * Deletes an image from S3/Spaces
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const bucket = this.configService.get<string>('do_spaces_bucket')!;

      // Parse key from URL
      const url = new URL(imageUrl);
      // For URL like http://localhost:9000/products/filename.jpg
      // Extract just the filename (last part of the path)
      const pathParts = url.pathname
        .split('/')
        .filter((part) => part.length > 0);

      // Get the filename (last part after removing bucket name if present)
      const key = pathParts[pathParts.length - 1];

      console.log(
        `Deleting image: bucket=${bucket}, key=${key}, original_url=${imageUrl}`,
      );

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (err) {
      console.error('S3 Delete Error:', err);
      // Swallow errors here, non-critical
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['images', 'variants', 'categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: ['images', 'variants', 'categories'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug, isActive: true },
      relations: ['images', 'variants', 'categories'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { images, categoryIds, unitAmount, currency, ...data } =
      createProductDto;

    // 1) Create Stripe Product
    const stripeProduct = await this.stripe.products.create({
      name: data.name,
      description: data.description,
    });
    // 2) Create Stripe Price
    const stripePrice = await this.stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: unitAmount,
      currency,
    });

    const product = this.productsRepository.create({
      ...data,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });

    if (categoryIds?.length) {
      product.categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
    }

    try {
      const saved = await this.productsRepository.save(product);
      if (images?.length) {
        const imageEntities = images.map((url, idx) =>
          this.productImageRepository.create({
            imageUrl: url,
            product: saved,
            sortOrder: idx,
            isPrimary: idx === 0,
          }),
        );
        await this.productImageRepository.save(imageEntities);
        saved.images = imageEntities;
      }
      return saved;
    } catch (err: any) {
      if (
        err instanceof QueryFailedError &&
        err.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Slug must be unique');
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { images, categoryIds, unitAmount, currency, ...data } =
      updateProductDto;
    const product = await this.findOne(id);

    // Keep track of what changed
    const nameChanged = data.name !== undefined && data.name !== product.name;
    const descChanged =
      data.description !== undefined &&
      data.description !== product.description;

    // 1) Apply all non-Stripe DTO fields locally
    Object.assign(product, data);

    // 2) If name or description changed, update the Stripe Product
    if (nameChanged || descChanged) {
      await this.stripe.products.update(product.stripeProductId, {
        ...(nameChanged ? { name: product.name } : {}),
        ...(descChanged ? { description: product.description } : {}),
      });
    }

    // 3) Rotate Stripe Price if price info provided
    if (unitAmount != null && currency) {
      await this.stripe.prices.update(product.stripePriceId, { active: false });
      const newPrice = await this.stripe.prices.create({
        product: product.stripeProductId,
        unit_amount: unitAmount,
        currency,
      });
      product.stripePriceId = newPrice.id;
    }

    // 4) Update categories if provided
    if (categoryIds) {
      product.categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
    }

    try {
      // 5) Persist changes
      const saved = await this.productsRepository.save(product);

      // 6) Handle images as before
      if (images?.length) {
        const oldImages = await this.productImageRepository.find({
          where: { productId: id },
        });
        await this.productImageRepository.delete({ productId: id });
        for (const img of oldImages) {
          try {
            await this.deleteImage(img.imageUrl);
          } catch (err) {
            console.error('Failed deleting old image:', err);
          }
        }

        const newEntities = images.map((url, idx) =>
          this.productImageRepository.create({
            imageUrl: url,
            product: saved,
            sortOrder: idx,
            isPrimary: idx === 0,
          }),
        );
        await this.productImageRepository.save(newEntities);
        saved.images = newEntities;
      }

      return saved;
    } catch (err: any) {
      if (
        err instanceof QueryFailedError &&
        err.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Slug must be unique');
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: number): Promise<{ success: boolean }> {
    // 1) Load your local product to get the Stripe IDs
    const product = await this.findOne(id);

    // 2) List all Stripe Prices for this product
    const prices = await this.stripe.prices.list({
      product: product.stripeProductId,
      limit: 100,
    });

    // 3) Deactivate each price, swallowing any errors
    await Promise.all(
      prices.data.map(async (price) => {
        try {
          await this.stripe.prices.update(price.id, { active: false });
        } catch (err) {
          console.warn(`Could not deactivate price ${price.id}:`, err);
        }
      }),
    );

    // 4) Archive (deactivate) the Stripe Product itself
    try {
      await this.stripe.products.update(product.stripeProductId, {
        active: false,
      });
    } catch (err) {
      console.warn(
        `Could not archive Stripe product ${product.stripeProductId}:`,
        err,
      );
    }

    // 5) Remove the record locally
    await this.productsRepository.remove(product);

    // 6) Cleanup any images
    const imgs = await this.productImageRepository.find({
      where: { productId: id },
    });
    // Using for...of instead of forEach to properly handle async operations
    for (const img of imgs) {
      try {
        await this.deleteImage(img.imageUrl);
      } catch (err) {
        console.error('Failed deleting image:', err);
      }
    }

    return { success: true };
  }

  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    const img = await this.productImageRepository.findOne({
      where: { id: imageId, product: { id: productId } },
    });
    if (!img) throw new NotFoundException('Image not found');
    await this.productImageRepository.remove(img);
    await this.deleteImage(img.imageUrl);
  }
}
