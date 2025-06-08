// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  getPublicUrl(objectKey: string): string {
    const host = this.config.get<string>('MINIO_API_HOST', 'localhost');
    const port = this.config.get<string>('MINIO_API_PORT', '9000');
    const bucket = this.config.get<string>('do_spaces_bucket');
    return `http://${host}:${port}/${bucket}/${objectKey}`;
  }
}
