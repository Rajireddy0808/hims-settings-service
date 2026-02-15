import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    return { message: 'Settings service is running', timestamp: new Date().toISOString() };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'settings-service' };
  }
}
