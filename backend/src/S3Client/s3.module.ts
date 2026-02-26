import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'S3',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Use consistent environment variable names (lowercase with underscores)
        const endpoint = config.get<string>('do_spaces_endpoint');
        const region = config.get<string>('do_spaces_region');
        const accessKey = config.get<string>('do_spaces_key');
        const secretKey = config.get<string>('do_spaces_secret');

        if (!endpoint || !region || !accessKey || !secretKey) {
          throw new Error('Missing required S3/R2 storage configuration');
        }

        const s3Config: S3ClientConfig = {
          endpoint,
          region,
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
          },
          // R2 and MinIO require path-style URLs; AWS S3 uses virtual-hosted style
          forcePathStyle: true,
        };

        return new S3Client(s3Config);
      },
    },
  ],
  exports: ['S3'],
})
export class S3Module {}
