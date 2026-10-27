import { INestApplication } from '@nestjs/common';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:4200'] });
}
