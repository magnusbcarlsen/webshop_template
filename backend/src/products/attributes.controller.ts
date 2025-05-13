import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';

// src/products/attributes.controller.ts
@Controller('products/attributes')
export class AttributesController {
  constructor(private svc: AttributesService) {}
  @Post() create(@Body() dto: CreateAttributeDto) {
    /* ... */
  }
  @Get() findAll() {
    /* ... */
  }
  @Get(':id') findOne(@Param() id) {
    /* ... */
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: CreateAttributeDto,
  ) {
    /* ... */
  }
  @Delete(':id') remove(@Param('id') id: string) {
    /* ... */
  }
}
