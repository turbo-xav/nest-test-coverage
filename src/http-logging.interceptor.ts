import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

const SENSITIVE_KEYS = ['authorization', 'cookie', 'password', 'token'];

// Masks sensitive values, at any depth, before they are written to the logs.
export function redact(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(redact);
  if (!data || typeof data !== 'object') return data;

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) =>
      SENSITIVE_KEYS.includes(key.toLowerCase())
        ? [key, '[REDACTED]']
        : [key, redact(value)],
    ),
  );
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const requestId = randomUUID();
    const start = Date.now();

    this.logger.log({
      requestId,
      type: 'request',
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      headers: redact(req.headers),
      body: redact(req.body),
    });

    return next.handle().pipe(
      tap((body: unknown) =>
        this.logger.log({
          requestId,
          type: 'response',
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          body: redact(body),
        }),
      ),
      catchError((error: unknown) => {
        this.logger.error({
          requestId,
          type: 'error',
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
          durationMs: Date.now() - start,
          message: error instanceof Error ? error.message : String(error),
        });
        return throwError(() => error);
      }),
    );
  }
}
