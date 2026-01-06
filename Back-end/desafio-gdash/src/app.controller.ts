import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiExcludeEndpoint()
  @Get('/')
  health() {
    return {
      app: 'GDASH API',
      status: 'online',
      version: '1.0.0',
      basePath: '/api',
      swagger: '/swagger',
      timestamp: new Date().toISOString(),
    };
  }
}
