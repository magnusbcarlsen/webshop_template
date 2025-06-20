// src/main.ts - TypeScript safe with correct middleware order
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import { raw, Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

// TypeScript interface for CSRF-enabled requests
interface RequestWithCSRF extends Request {
  csrfToken(): string;
}

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

  // IMPORTANT: Add endpoints that don't need CSRF BEFORE the CSRF middleware

  // Health check endpoint (before CSRF middleware)
  app.use('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      csrf: 'not-required',
    });
  });

  // CSRF Protection configuration
  const csrfMiddleware = csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    // Remove the secret property - csurf handles this automatically
  });

  // Conditional CSRF middleware - apply CSRF to most routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip for Stripe webhooks
    if (req.path.startsWith('/api/stripe/webhook')) return next();
    // Skip for health checks
    if (req.path === '/health' || req.path === '/api/health') return next();
    // Skip for CSRF token endpoint itself
    if (req.path === '/csrf-token' || req.path === '/api/csrf-token')
      return next();

    // Apply CSRF protection for all other routes
    return csrfMiddleware(req, res, next);
  });

  // NOW add the CSRF token endpoint (after CSRF middleware is configured)
  app.use('/csrf-token', (req: RequestWithCSRF, res: Response) => {
    try {
      console.log('CSRF token requested');
      const token: string = req.csrfToken();
      console.log('CSRF token generated successfully');
      res.json({
        csrfToken: token,
        success: true,
      });
    } catch (error) {
      console.error('CSRF token generation error:', error);
      res.status(500).json({
        error: 'Failed to generate CSRF token',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
      'https://bergstromart.dk', // Your production domain
      'https://www.bergstromart.dk', // Your production domain with www
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
      'X-CSRF-Token', // Allow CSRF token header
      'CSRF-Token', // Alternative CSRF header name
    ],
  });

  // API-prefixed CSRF token endpoint (after setGlobalPrefix)
  app.use('/api/csrf-token', (req: RequestWithCSRF, res: Response) => {
    try {
      console.log('API CSRF token requested');
      const token: string = req.csrfToken();
      console.log('API CSRF token generated successfully');
      res.json({
        csrfToken: token,
        success: true,
      });
    } catch (error) {
      console.error('API CSRF token generation error:', error);
      res.status(500).json({
        error: 'Failed to generate CSRF token',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // API Health check endpoint (after setGlobalPrefix)
  app.use('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      csrf: 'protected',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0'); // Listen on all interfaces

  // Console logs for confirmation
  console.log(`🚀 Application running on port ${process.env.PORT || 3001}`);
  console.log(
    `🛡️ CSRF Protection: ${process.env.NODE_ENV === 'production' ? 'ENABLED (Secure)' : 'ENABLED (Development)'}`,
  );
  console.log('🔗 CSRF Token endpoints:');
  console.log('  - /csrf-token (direct)');
  console.log('  - /api/csrf-token (with API prefix)');
  console.log('  - /health (health check)');
  console.log('  - /api/health (API health check)');
}

bootstrap();
