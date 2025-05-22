// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 1) prefix all routes with /api
  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 2) allow CORS from your frontend - Updated to match nginx proxy
  app.enableCors({
    origin: [
      'http://localhost:3000', // Direct frontend access
      'http://localhost', // Nginx proxy access
      'http://frontend:3000', // Docker internal network
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Cart-ID', // Allow our custom header
    ],
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0'); // Listen on all interfaces
}
bootstrap();
