import { IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds?: number[];
  @IsOptional()
  images?: string[]; // Array of image URLs or paths
}
