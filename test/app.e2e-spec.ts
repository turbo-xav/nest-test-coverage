import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) should not exist without the /api prefix', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('CORS', () => {
    it('should allow requests from http://localhost:4200', () => {
      return request(app.getHttpServer())
        .get('/api')
        .set('Origin', 'http://localhost:4200')
        .expect('Access-Control-Allow-Origin', 'http://localhost:4200');
    });

    it('should not allow requests from another origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api')
        .set('Origin', 'http://evil.com');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
