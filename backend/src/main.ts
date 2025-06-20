// src/main.ts - Your version with the missing pieces added
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import { raw, Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/api/stripe/webhook', raw({ type: 'application/json' }));
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

  app.use(cookieParser());

  // CSRF Protection with enhanced configuration
  const csrfMiddleware = csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  });

  // Conditional CSRF middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip for Stripe webhooks
    if (req.path.startsWith('/api/stripe/webhook')) return next();
    // Skip for CSRF token endpoint itself
    if (req.path === '/api/csrf-token') return next();
    // Skip for health checks
    if (req.path === '/api/health') return next();

    // Apply CSRF protection for all other routes
    return csrfMiddleware(req, res, next);
  });

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

  // 2) allow CORS from your frontend - Updated to match nginx proxy
  app.enableCors({
    origin: [
      'http://localhost:3000', // Direct frontend access
      'http://localhost', // Nginx proxy access
      'http://frontend:3000', // Docker internal network
      'https://bergstromart.dk', // ADD: Your production domain
      'https://www.bergstromart.dk', // ADD: Your production domain with www
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
      'X-CSRF-Token', // ADD: Allow CSRF token header
      'CSRF-Token', // ADD: Alternative CSRF header name
    ],
  });

  interface RequestWithCSRF extends Request {
    csrfToken(): string;
  }

  // Then use it in your endpoint:
  app.use('/api/csrf-token', (req: RequestWithCSRF, res: Response) => {
    try {
      const token: string = req.csrfToken();
      res.json({
        csrfToken: token,
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate CSRF token',
        success: false,
      });
    }
  });

  // ADD: Health check endpoint
  app.use('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      csrf: 'protected',
    });
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0'); // Listen on all interfaces

  // ADD: Console logs for confirmation
  console.log(`🚀 Application running on port ${process.env.PORT || 3001}`);
  console.log(
    `🛡️ CSRF Protection: ${process.env.NODE_ENV === 'production' ? 'ENABLED (Secure)' : 'ENABLED (Development)'}`,
  );
}

bootstrap();
