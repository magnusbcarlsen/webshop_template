//products.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  HttpStatus,
  ParseFilePipeBuilder,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ← new
import { RolesGuard } from '../auth/roles.guard'; // ← new
import { Roles } from '../auth/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import 'multer';
import type { Express } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // ← new
  @Roles('ADMIN') // ← new
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    files?: Express.Multer.File[],
  ) {
    console.log('Received create request:', {
      body: createProductDto,
      files: files?.length || 0,
    });

    // Parse categoryIds if it's a string  (from FormData)
    if (typeof createProductDto.categoryIds === 'string') {
      try {
        createProductDto.categoryIds = JSON.parse(
          createProductDto.categoryIds,
        ) as number[];
      } catch (error) {
        console.error('Failed to parse categoryIds:', error);
        createProductDto.categoryIds = [];
      }
    }

    // Convert string numbers to actual numbers (FormData converts everything to strings)
    if (typeof createProductDto.price === 'string') {
      createProductDto.price = parseFloat(createProductDto.price);
    }
    if (typeof createProductDto.stockQuantity === 'string') {
      createProductDto.stockQuantity = parseInt(
        createProductDto.stockQuantity,
        10,
      );
    }
    if (typeof createProductDto.salePrice === 'string') {
      createProductDto.salePrice =
        parseFloat(createProductDto.salePrice) || undefined;
    }

    // Handle boolean fields from FormData (they come as strings)
    if (typeof createProductDto.isFeatured === 'string') {
      createProductDto.isFeatured = createProductDto.isFeatured === 'true';
    }
    if (typeof createProductDto.isActive === 'string') {
      createProductDto.isActive = createProductDto.isActive === 'true';
    }

    // Upload images if provided
    if (files && files.length) {
      const urls = await Promise.all(
        files.map((f) => this.productsService.uploadImage(f)),
      );
      createProductDto.images = urls;
    }

    console.log('Processed create data:', createProductDto);

    const result = await this.productsService.create(createProductDto);
    console.log('Create result:', result);

    return result;
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // ← new
  @Roles('ADMIN') // ← new
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    files?: Express.Multer.File[],
  ) {
    console.log('Received update request:', {
      id,
      body: updateProductDto,
      files: files?.length || 0,
    });

    // Parse categoryIds if it's a string (from FormData)
    if (typeof updateProductDto.categoryIds === 'string') {
      try {
        updateProductDto.categoryIds = JSON.parse(
          updateProductDto.categoryIds,
        ) as number[];
      } catch (error) {
        console.error('Failed to parse categoryIds:', error);
        updateProductDto.categoryIds = [];
      }
    }

    // Convert string numbers to actual numbers (FormData converts everything to strings)
    if (typeof updateProductDto.price === 'string') {
      updateProductDto.price = parseFloat(updateProductDto.price);
    }
    if (typeof updateProductDto.stockQuantity === 'string') {
      updateProductDto.stockQuantity = parseInt(
        updateProductDto.stockQuantity,
        10,
      );
    }
    if (typeof updateProductDto.salePrice === 'string') {
      updateProductDto.salePrice =
        parseFloat(updateProductDto.salePrice) || undefined;
    }

    // Handle boolean fields from FormData (they come as strings)
    if (typeof updateProductDto.isFeatured === 'string') {
      updateProductDto.isFeatured = updateProductDto.isFeatured === 'true';
    }
    if (typeof updateProductDto.isActive === 'string') {
      updateProductDto.isActive = updateProductDto.isActive === 'true';
    }

    // Upload images if provided
    if (files && files.length) {
      const urls = await Promise.all(
        files.map((file) => this.productsService.uploadImage(file)),
      );
      updateProductDto.images = urls;
    }

    console.log('Processed update data:', updateProductDto);

    const result = await this.productsService.update(id, updateProductDto);
    console.log('Update result:', result);

    return result;
  }

  // Delete a single image from a product
  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard) // ← new
  @Roles('ADMIN') // ← new
  async deleteImage(
    @Param('id', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return await this.productsService.deleteProductImage(productId, imageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    console.log('Deleting product:', id);
    await this.productsService.remove(id);
    console.log('Delete completed');

    // Return a success response instead of void
    return { success: true, message: 'Product deleted successfully' };
  }
}
