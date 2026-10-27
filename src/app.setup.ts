import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const corsOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix(config.get<string>('GLOBAL_PREFIX', 'api'));
  app.enableCors({ origin: corsOrigins });
}
