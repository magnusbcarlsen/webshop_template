import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantAttributeDto {
  @IsNumber() attributeValueId: number;
}

export class CreateVariantDto {
  @IsString() @IsOptional() sku?: string;
  @IsNumber() price: number;
  @IsNumber() @IsOptional() salePrice?: number;
  @IsNumber() @IsOptional() stockQuantity?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];
}
