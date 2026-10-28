import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity.js';

@Injectable()
export class PersonService implements OnModuleInit {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.personRepository.count();
    if (count === 0) {
      await this.personRepository.save([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);
    }
  }

  findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }
}
