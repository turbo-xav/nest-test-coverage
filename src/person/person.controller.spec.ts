import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from './person.controller.js';
import { PersonService } from './person.service.js';

describe('PersonController', () => {
  let personController: PersonController;
  const personServiceMock = {
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: personServiceMock }],
    }).compile();

    personController = module.get<PersonController>(PersonController);
  });

  describe('findAll', () => {
    it('should return an array of persons', async () => {
      const persons = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      personServiceMock.findAll.mockResolvedValue(persons);

      await expect(personController.findAll()).resolves.toEqual(persons);
      expect(personServiceMock.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
