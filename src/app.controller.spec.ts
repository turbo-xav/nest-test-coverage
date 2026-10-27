import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getHello: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the value provided by AppService', () => {
      appServiceMock.getHello.mockReturnValue('mocked hello');

      expect(appController.getHello()).toBe('mocked hello');
      expect(appServiceMock.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
