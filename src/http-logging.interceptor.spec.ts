import {
  CallHandler,
  ExecutionContext,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { HttpLoggingInterceptor, redact } from './http-logging.interceptor.js';

function createContext(
  req: Record<string, unknown>,
  res: Record<string, unknown> = { statusCode: 200 },
  type = 'http',
): ExecutionContext {
  return {
    getType: () => type,
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

function createHandler(result: ReturnType<CallHandler['handle']>): CallHandler {
  return { handle: () => result };
}

describe('HttpLoggingInterceptor', () => {
  let interceptor: HttpLoggingInterceptor;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  const req = {
    method: 'POST',
    originalUrl: '/api/login?lang=fr',
    query: { lang: 'fr' },
    headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
    body: { email: 'user@test.com', password: 'secret' },
  };

  beforeEach(() => {
    interceptor = new HttpLoggingInterceptor();
    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log the request with sensitive data redacted', async () => {
    await firstValueFrom(
      interceptor.intercept(createContext(req), createHandler(of('ok'))),
    );

    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'request',
        method: 'POST',
        url: '/api/login?lang=fr',
        query: { lang: 'fr' },
        headers: {
          authorization: '[REDACTED]',
          'content-type': 'application/json',
        },
        body: { email: 'user@test.com', password: '[REDACTED]' },
      }),
    );
  });

  it('should log the response with the same requestId', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(
        createContext(req, { statusCode: 201 }),
        createHandler(of({ token: 'abc', user: 'john' })),
      ),
    );

    expect(result).toEqual({ token: 'abc', user: 'john' });

    const requestLog = logSpy.mock.calls[0][0];
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestId: requestLog.requestId,
        type: 'response',
        statusCode: 201,
        durationMs: expect.any(Number),
        body: { token: '[REDACTED]', user: 'john' },
      }),
    );
  });

  it('should log errors and rethrow them', async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(
          createContext(req),
          createHandler(throwError(() => new NotFoundException('Not here'))),
        ),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        statusCode: 404,
        message: 'Not here',
      }),
    );
  });

  it('should use status 500 for non-HTTP errors', async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(
          createContext(req),
          createHandler(throwError(() => new Error('Boom'))),
        ),
      ),
    ).rejects.toThrow('Boom');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'Boom' }),
    );
  });

  it('should stringify thrown values that are not Error instances', async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(
          createContext(req),
          createHandler(throwError(() => 'oops')),
        ),
      ),
    ).rejects.toBe('oops');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'oops' }),
    );
  });

  it('should not log non-HTTP contexts', async () => {
    await firstValueFrom(
      interceptor.intercept(createContext(req, {}, 'rpc'), createHandler(of('ok'))),
    );

    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe('redact', () => {
  it('should mask sensitive keys at any depth, case-insensitively', () => {
    expect(
      redact({
        Password: 'x',
        user: { name: 'john', token: 'y' },
        items: [{ cookie: 'z' }],
      }),
    ).toEqual({
      Password: '[REDACTED]',
      user: { name: 'john', token: '[REDACTED]' },
      items: [{ cookie: '[REDACTED]' }],
    });
  });

  it('should return primitive values unchanged', () => {
    expect(redact('hello')).toBe('hello');
    expect(redact(null)).toBeNull();
  });
});
