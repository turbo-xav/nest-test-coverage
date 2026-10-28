import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { Person } from './../src/person/person.entity.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const seededPersons: Person[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];
  const personRepositoryMock = {
    count: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
  };

  async function createApp() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({ destroy: vi.fn() })
      .overrideProvider(getRepositoryToken(Person))
      .useValue(personRepositoryMock)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    personRepositoryMock.count.mockResolvedValue(0);
    personRepositoryMock.save.mockResolvedValue(seededPersons);
    personRepositoryMock.find.mockResolvedValue(seededPersons);

    // Values set in process.env take precedence over the .env file, so the
    // tests do not depend on the local .env content.
    vi.stubEnv('GLOBAL_PREFIX', 'api');
    vi.stubEnv('CORS_ORIGINS', 'http://localhost:4200');
    await createApp();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/person (GET) should return seeded persons', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/person')
      .expect(200);

    expect(response.body).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
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

  describe('configuration', () => {
    it('should use GLOBAL_PREFIX as route prefix', async () => {
      await app.close();
      vi.stubEnv('GLOBAL_PREFIX', 'v1');
      await createApp();

      await request(app.getHttpServer())
        .get('/v1')
        .expect(200)
        .expect('Hello World!');
      await request(app.getHttpServer()).get('/api').expect(404);
    });

    it('should use CORS_ORIGINS as allowed origins', async () => {
      await app.close();
      vi.stubEnv('CORS_ORIGINS', 'http://a.com');
      await createApp();

      await request(app.getHttpServer())
        .get('/api')
        .set('Origin', 'http://a.com')
        .expect('Access-Control-Allow-Origin', 'http://a.com');
    });
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });
});
