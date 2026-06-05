// backend/src/exhibitions/exhibitions.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Express } from 'express';
import 'multer';
import { Exhibition } from './entities/exhibition.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(
    @InjectRepository(Exhibition)
    private readonly repo: Repository<Exhibition>,
    @Inject('S3') private readonly s3: S3Client,
    private readonly config: ConfigService,
  ) {}

  async findActive(now: Date = new Date()): Promise<Exhibition[]> {
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    return this.repo.find({
      where: {
        isActive: true,
        displayFrom: LessThanOrEqual(today),
        displayUntil: MoreThanOrEqual(today),
      },
      order: { eventStartDate: 'ASC' },
    });
  }

  findAll(): Promise<Exhibition[]> {
    return this.repo.find({ order: { eventStartDate: 'DESC' } });
  }

  async findOne(id: number): Promise<Exhibition> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Exhibition ${id} not found`);
    return row;
  }

  async create(dto: CreateExhibitionDto): Promise<Exhibition> {
    this.assertSafeExternalUrl(dto.externalUrl);
    const entity = this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateExhibitionDto): Promise<Exhibition> {
    if ('externalUrl' in dto) this.assertSafeExternalUrl(dto.externalUrl);
    const existing = await this.findOne(id);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  /**
   * externalUrl is rendered as <a href> on the public page. Reject anything
   * that isn't http(s) so a "javascript:..." or "data:..." link can't slip
   * past the missing global ValidationPipe.
   */
  private assertSafeExternalUrl(url: string | null | undefined): void {
    if (!url) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('externalUrl is not a valid URL');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException(
        'externalUrl must use http or https',
      );
    }
  }

  async remove(id: number): Promise<{ success: true }> {
    const existing = await this.findOne(id);
    if (existing.imageUrl) {
      await this.deleteImage(existing.imageUrl);
    }
    await this.repo.remove(existing);
    return { success: true };
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const bucket = this.config.get<string>('do_spaces_bucket')!;
    const ext = path.extname(file.originalname);
    const key = `${uuidv4()}${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'max-age=31536000',
        }),
      );
    } catch (err) {
      console.error('S3 Upload Error:', err);
      throw new InternalServerErrorException('Failed to upload image');
    }

    // R2_PUBLIC_URL (custom domain) serves objects at `<domain>/<key>` without the
    // bucket prefix. The MinIO fallback uses path-style URLs and must include the
    // bucket name. Compose accordingly so both deploys produce a browser-loadable URL.
    const publicUrl =
      this.config.get<string>('R2_PUBLIC_URL') ||
      `http://localhost:9000/${bucket}`;
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const bucket = this.config.get<string>('do_spaces_bucket')!;
      const url = new URL(imageUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      // Key is always a flat UUID filename — uploadImage never adds a subfolder prefix.
      const key = parts[parts.length - 1];
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key }),
      );
    } catch (err) {
      console.error('S3 Delete Error:', err);
      // Non-fatal — keep going.
    }
  }

}
