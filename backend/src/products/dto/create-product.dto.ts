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
  categoryId?: number;
}
