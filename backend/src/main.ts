// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import { raw, Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter().getInstance() as Express;
  server.set('trust proxy', 1);

  app.use('/api/stripe/webhook', raw({ type: 'application/json' }));

  // Global rate limit - applies to all routes (defense in depth)
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute per IP
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === '/api/stripe/webhook', // Skip webhook
    }),
  );

  // Stricter rate limit for login
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 requests per window
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Stricter rate limit for registration (if you have one)
  app.use(
    '/api/auth/register',
    rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 registrations per hour per IP
      message: 'Too many accounts created, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(cookieParser());

  // 1) prefix all routes with /api
  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Enhanced Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://js.stripe.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https://api.stripe.com'],
          fontSrc: ["'self'"],
          frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for Stripe compatibility
    }),
  );

  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(bodyParser.json());

  // 2) allow CORS from your frontend - Updated to include production domains
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost',
      'http://frontend:3000',
      frontendUrl,
      'https://bergstromart.dk',
      'https://www.bergstromart.dk',
      'https://bergstromart.vercel.app',
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

  // Console logs for confirmation
  console.log(`🚀 Application running on port ${process.env.PORT || 3001}`);
}

bootstrap();
