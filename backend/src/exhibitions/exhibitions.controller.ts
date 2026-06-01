// backend/src/exhibitions/exhibitions.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly service: ExhibitionsService) {}

  // Public — used by the frontpage.
  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  // Admin list — all rows including inactive/past.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateExhibitionDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    this.coerceMultipart(dto);
    if (file) {
      dto.imageUrl = await this.service.uploadImage(file);
    }
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExhibitionDto & { removeImage?: boolean | string },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    this.coerceMultipart(dto);

    const removeImage =
      dto.removeImage === true || dto.removeImage === 'true';
    delete dto.removeImage;

    if (file) {
      // Delete previous image first to avoid orphans.
      const current = await this.service.findOne(id);
      if (current.imageUrl) {
        await this.service.deleteImage(current.imageUrl);
      }
      dto.imageUrl = await this.service.uploadImage(file);
    } else if (removeImage) {
      const current = await this.service.findOne(id);
      if (current.imageUrl) {
        await this.service.deleteImage(current.imageUrl);
      }
      dto.imageUrl = null;
    }

    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /**
   * Multipart form data arrives as strings. Convert booleans before
   * class-validator runs against the merged DTO.
   */
  private coerceMultipart(
    dto: Partial<CreateExhibitionDto> & { isActive?: boolean | string },
  ): void {
    if (typeof dto.isActive === 'string') {
      dto.isActive = dto.isActive === 'true';
    }
  }
}
