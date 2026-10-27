import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getReturnString(string1: string,string2: string): string {
    return string1+' '+string2;
  }
}
