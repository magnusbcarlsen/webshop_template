// backend/src/orders/dto/create-order.dto.ts
import {
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  variantId?: number;
}

export class CreateOrderDto {
  @IsString()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  billingAddress: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
