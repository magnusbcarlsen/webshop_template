// backend/src/exhibitions/dto/update-exhibition.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateExhibitionDto } from './create-exhibition.dto';

export class UpdateExhibitionDto extends PartialType(CreateExhibitionDto) {}
