import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  variantId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
