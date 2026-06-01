// backend/src/exhibitions/dto/create-exhibition.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExhibitionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  externalUrl?: string | null;

  @IsDateString({ strict: true })
  eventStartDate: string;

  @IsDateString({ strict: true })
  eventEndDate: string;

  @IsDateString({ strict: true })
  displayFrom: string;

  @IsDateString({ strict: true })
  displayUntil: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
