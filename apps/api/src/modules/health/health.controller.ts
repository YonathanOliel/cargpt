import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; time: string } {
    return { status: 'ok', service: 'cargpt-api', time: new Date().toISOString() };
  }
}
