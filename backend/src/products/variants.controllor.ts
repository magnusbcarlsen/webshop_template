import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';

// src/products/attributes.controller.ts
@Controller('products/variants')
export class VariantsController {
  constructor(private svc: VariantsService) {}
  @Post() create(@Body() dto: CreateVariantDto) {
    /* ... */
  }
  @Get() findAll() {
    /* ... */
  }
  @Get(':id') findOne(@Param() id) {
    /* ... */
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    /* ... */
  }
  @Delete(':id') remove(@Param('id') id: string) {
    /* ... */
  }
}
