import { INestApplication } from '@nestjs/common';
import { HttpLoggingInterceptor } from './http-logging.interceptor.js';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:4200'] });
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
}
