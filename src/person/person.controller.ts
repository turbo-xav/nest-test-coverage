import { Controller, Get } from '@nestjs/common';
import { Person } from './person.entity.js';
import { PersonService } from './person.service.js';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }
}
