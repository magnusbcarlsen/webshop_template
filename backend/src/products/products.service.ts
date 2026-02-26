// products.service.ts - FIXED VERSION

import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, In, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource, // Add this for transactions
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

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'max-age=31536000', // 1 year cache
        }),
      );
    } catch (err) {
      console.error('S3 Upload Error:', err);
      throw new InternalServerErrorException('Failed to upload image');
    }

    // Build the public URL — for R2 this is the r2.dev or custom domain URL
    const publicUrl =
      this.configService.get<string>('R2_PUBLIC_URL') ||
      'http://localhost:9000';
    // R2 public URLs have the format: https://<public-url>/<key> (no bucket prefix)
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
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

    // Use transaction to ensure consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Create the product in database first
      const product = queryRunner.manager.create(Product, data);

      if (categoryIds?.length) {
        product.categories = await this.categoryRepository.findBy({
          id: In(categoryIds),
        });
      }

      const savedProduct = await queryRunner.manager.save(product);

      // 2) Create Stripe Product with METADATA linking back to database
      const stripeProduct = await this.stripe.products.create({
        name: savedProduct.name,
        description: savedProduct.description || undefined,
        metadata: {
          productId: savedProduct.id.toString(), // CRITICAL: Link back to DB!
          sku: savedProduct.sku || '',
        },
      });

      // 3) Create Stripe Price with METADATA linking back to database
      const stripePrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: unitAmount,
        currency: currency || 'dkk',
        metadata: {
          productId: savedProduct.id.toString(), // CRITICAL: Link back to DB!
          sku: savedProduct.sku || '',
        },
      });

      // 4) Update the product with Stripe IDs
      await queryRunner.manager.update(Product, savedProduct.id, {
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });

      // 5) Handle images
      if (images?.length) {
        const imageEntities = images.map((url, idx) =>
          queryRunner.manager.create(ProductImage, {
            imageUrl: url,
            product: savedProduct,
            sortOrder: idx,
            isPrimary: idx === 0,
          }),
        );
        await queryRunner.manager.save(imageEntities);
        savedProduct.images = imageEntities;
      }

      await queryRunner.commitTransaction();

      console.log('Product created successfully with Stripe metadata:', {
        productId: savedProduct.id,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        metadata: stripeProduct.metadata,
      });

      return savedProduct;
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating product:', err);

      if (
        err instanceof QueryFailedError &&
        err.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Slug must be unique');
      }
      throw new InternalServerErrorException('Failed to create product');
    } finally {
      await queryRunner.release();
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
    const skuChanged = data.sku !== undefined && data.sku !== product.sku;

    // 1) Apply all non-Stripe DTO fields locally
    Object.assign(product, data);

    // 2) If name, description, or SKU changed, update the Stripe Product
    if (nameChanged || descChanged || skuChanged) {
      await this.stripe.products.update(product.stripeProductId, {
        ...(nameChanged ? { name: product.name } : {}),
        ...(descChanged ? { description: product.description } : {}),
        metadata: {
          productId: product.id.toString(), // Ensure metadata is always present
          sku: product.sku || '',
        },
      });
    }

    // 3) Rotate Stripe Price if price info provided
    if (unitAmount != null && currency) {
      await this.stripe.prices.update(product.stripePriceId, { active: false });
      const newPrice = await this.stripe.prices.create({
        product: product.stripeProductId,
        unit_amount: unitAmount,
        currency,
        metadata: {
          productId: product.id.toString(), // Ensure metadata is on new price too
          sku: product.sku || '',
        },
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

  /**
   * Fix existing products that don't have metadata in Stripe
   * You can call this method to fix your existing product (ID 19)
   */
  async fixStripeMetadata(productId: number): Promise<void> {
    const product = await this.findOne(productId);

    console.log('Fixing Stripe metadata for product:', {
      productId: product.id,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId,
    });

    // Update the Stripe product metadata
    if (product.stripeProductId) {
      await this.stripe.products.update(product.stripeProductId, {
        metadata: {
          productId: product.id.toString(),
          sku: product.sku || '',
        },
      });
    }

    // Update the Stripe price metadata
    if (product.stripePriceId) {
      await this.stripe.prices.update(product.stripePriceId, {
        metadata: {
          productId: product.id.toString(),
          sku: product.sku || '',
        },
      });
    }

    console.log('Stripe metadata fixed for product', productId);
  }
}
