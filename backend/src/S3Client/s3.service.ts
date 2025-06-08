// src/s3/s3.service.ts
import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    @Inject('S3') private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const bucket = this.config.get<string>('do_spaces_bucket');
    if (!bucket) {
      this.logger.error(`Missing do_spaces_bucket in your .env`);
      return;
    }

    try {
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket "${bucket}" created successfully`);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'name' in err &&
        err.name === 'BucketAlreadyOwnedByYou'
      ) {
        this.logger.log(`Bucket "${bucket}" already exists`);
      } else {
        this.logger.error(`Error creating bucket "${bucket}"`, err);
      }
    }
  }
}
