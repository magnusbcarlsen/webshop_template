// import { IsArray, IsInt, IsOptional, Min } from 'class-validator';

// export class CreateProductDto {
//   name: string;
//   slug: string;
//   description?: string;
//   price: number;
//   salePrice?: number;
//   stockQuantity: number;
//   sku?: string;
//   weight?: number;
//   dimensions?: string;
//   isFeatured?: boolean;
//   isActive?: boolean;
//   unitAmount: number;
//   currency: string;
//   @IsOptional()
//   @IsArray()
//   @IsInt({ each: true })
//   @Min(1, { each: true })
//   categoryIds?: number[];
//   @IsOptional()
//   images?: string[]; // Array of image URLs or paths
// }

// src/products/dto/create-product.dto.ts

import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  IsArray,
  ArrayNotEmpty,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice?: number;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * The amount in the smallest currency unit (e.g. øre for DKK).
   */
  @IsNumber()
  @Min(0)
  unitAmount: number;

  /**
   * Three-letter ISO currency code (e.g. "DKK", "USD").
   */
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a three-letter ISO code',
  })
  currency: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
