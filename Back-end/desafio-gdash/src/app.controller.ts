import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get('/api')
  health() {
    return {
      app: 'GDASH API',
      status: 'online',
      basePath: '/api',
      swagger: '/swagger',
      timestamp: new Date().toISOString(),
    };
  }
}