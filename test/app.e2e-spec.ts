import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
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

  describe('HTTP logging', () => {
    it('should log the incoming request and its response', async () => {
      const logSpy = vi
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => {});

      await request(app.getHttpServer()).get('/api?lang=fr').expect(200);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'request',
          method: 'GET',
          url: '/api?lang=fr',
          query: { lang: 'fr' },
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'response',
          statusCode: 200,
          body: 'Hello World!',
        }),
      );
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });
});
