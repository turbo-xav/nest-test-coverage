import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Person } from './person/person.entity.js';
import { PersonModule } from './person/person.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5433)),
        username: config.get<string>('DB_USERNAME', 'admin'),
        password: config.get<string>('DB_PASSWORD', 'admin'),
        database: config.get<string>('DB_DATABASE', 'nest-person'),
        entities: [Person],
        synchronize: true,
      }),
    }),
    PersonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
