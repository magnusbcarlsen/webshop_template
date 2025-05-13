import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class CreateWishlistDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsString()
  name?: string;
}
