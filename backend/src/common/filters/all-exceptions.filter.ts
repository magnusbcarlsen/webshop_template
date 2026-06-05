// backend/src/common/filters/all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Surfaces a useful error message to the client instead of Nest's default
 * "Internal server error" sanitization. HttpException keeps its declared
 * status and message; everything else becomes a 500 with the underlying
 * error's message so the admin UI can show what actually went wrong.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const p = payload as { message?: string | string[]; error?: string };
        message = p.message ?? exception.message;
        error = p.error;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      // Never expose raw SQL fragments or schema names to clients.
      // The full message + stack are still logged below for ops.
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error';
      error = 'QueryFailedError';
    } else if (exception instanceof Error) {
      // Generic Error.message could also leak internals (e.g. file paths,
      // third-party SDK output). Keep the default "Internal server error"
      // message and surface only the error name for triage.
      error = exception.name;
    }

    this.logger.error(
      `${req.method} ${req.url} -> ${status} ${error ?? ''} ${
        Array.isArray(message) ? message.join('; ') : message
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    res.status(status).json({
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      path: req.url,
    });
  }
}
