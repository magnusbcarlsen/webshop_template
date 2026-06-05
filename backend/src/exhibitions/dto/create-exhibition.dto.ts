// backend/src/exhibitions/dto/create-exhibition.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateExhibitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  externalUrl?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  eventStartDate?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  eventEndDate?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  displayFrom?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  displayUntil?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
