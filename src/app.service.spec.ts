import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service.js';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();
    appService = app.get<AppService>(AppService);
  });

  afterEach( () => {
    vi.restoreAllMocks();
  })

  describe('getHello', () => {
    it('should return "Hello World with Mock!"', () => {
      /*const spyHello = vi
        .spyOn(appService, 'getHello')
        .mockImplementation(() => 'Hello World with Mock!');*/
      vi.spyOn(AppService.prototype, 'getHello').mockImplementation(
        () => 'Hello World with Mock!',
      );

      expect(appService.getHello()).toBe('Hello World with Mock!');
    });

    it('should return "Hello World!"', () => {
      expect(appService.getHello()).toBe('Hello World!');
    });

  });

  describe('getReturnString', () => {

    it('should return "Hello World!"', () => {
      const returnString: string = appService.getReturnString('Hello', 'World!');
      expect(returnString).toBe('Hello World!');

  });

    it('should mockImplementation return "otherString"', () => {
      const spyReturnString = vi
        .spyOn(appService, 'getReturnString')
        .mockImplementation((): string => {
        return 'other string';
      });

      const returnStringMocked: string = appService.getReturnString('Hello', 'World!');
      const returnStringMocked2: string = appService.getReturnString(
        'Bye',
        'World!',
      );

      expect(returnStringMocked).toBe('other string');
      expect(returnStringMocked2).toBe('other string');
      expect(appService.getReturnString).toHaveBeenCalled();
      expect(appService.getReturnString).toHaveReturned();
      expect(appService.getReturnString).toHaveBeenCalledWith('Hello','World!');
      expect(appService.getReturnString).toHaveBeenCalledTimes(2);
      expect(appService.getReturnString).toHaveBeenNthCalledWith(1, 'Hello','World!');
      expect(appService.getReturnString).toHaveBeenNthCalledWith(2, 'Bye','World!');
      expect(spyReturnString).toHaveBeenNthCalledWith(1, 'Hello', 'World!');
      expect(spyReturnString).toHaveBeenNthCalledWith(2, 'Bye', 'World!');
    });
  })
});