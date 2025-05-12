// src/orders/dto/create-order.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber() productId: number;
  @IsNumber() quantity: number;
}

export class CreateOrderDto {
  @IsString() @MinLength(1) guestName: string;
  @IsEmail() guestEmail: string;

  @IsString() @MinLength(5) shippingAddress: string;
  @IsString() @MinLength(5) billingAddress: string;

  @IsOptional() @IsString() paymentMethod?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
