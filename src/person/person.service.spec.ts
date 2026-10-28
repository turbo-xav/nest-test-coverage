import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Person } from './person.entity.js';
import { PersonService } from './person.service.js';

describe('PersonService', () => {
  let personService: PersonService;
  const personRepositoryMock = {
    count: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: personRepositoryMock,
        },
      ],
    }).compile();

    personService = module.get<PersonService>(PersonService);
  });

  describe('onModuleInit', () => {
    it('should seed default persons when table is empty', async () => {
      personRepositoryMock.count.mockResolvedValue(0);

      await personService.onModuleInit();

      expect(personRepositoryMock.count).toHaveBeenCalledTimes(1);
      expect(personRepositoryMock.save).toHaveBeenCalledWith([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);
    });

    it('should not seed persons when table is not empty', async () => {
      personRepositoryMock.count.mockResolvedValue(3);

      await personService.onModuleInit();

      expect(personRepositoryMock.count).toHaveBeenCalledTimes(1);
      expect(personRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all persons from repository', async () => {
      const persons = [{ id: 1, name: 'Alice' }];
      personRepositoryMock.find.mockResolvedValue(persons);

      await expect(personService.findAll()).resolves.toEqual(persons);
      expect(personRepositoryMock.find).toHaveBeenCalledTimes(1);
    });
  });
});
